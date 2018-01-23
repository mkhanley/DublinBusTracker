'use strict';
let soap = require('soap');
let bodyParser = require('body-parser');
let express = require('express');
let app = express();
app.use(bodyParser.json());

function getData(stopId, response){
    let url = 'http://rtpi.dublinbus.ie/DublinBusRTPIService.asmx?wsdl';
    let args = {stopId: stopId};
    soap.createClient(url, function(err, client) {
        client.GetRealTimeStopData(args, function(err, result) {
            let res = result.GetRealTimeStopDataResult;
            if (res.diffgram){
                let data = res.diffgram.DocumentElement.StopData;
                let info = "";
                for(let i = 0; i < data.length; i++){
                    let bus, num, dest, timeNow, timeArrival, diff;
                    bus = data[i];
                    num = bus.MonitoredVehicleJourney_PublishedLineName;
                    dest = bus.MonitoredVehicleJourney_DestinationName;
                    timeNow = Date.parse(bus.StopMonitoringDelivery_ResponseTimestamp);
                    timeArrival = Date.parse(bus.MonitoredCall_ExpectedArrivalTime);
                    diff = Math.floor((timeArrival - timeNow) / 1000 /60);
                    info += num + " to " + dest + " in " + diff + " minutes" +"\n";
                }
                console.log(info);
                response.send(info);
            }
            else{
                response.status(500).send("Could not find stop");
            }
        });
    });
}

app.post('/', (req, res) => {
    if(req.body.result.parameters.number){
        getData(req.body.result.parameters.number, res);
    }
    else{

    }
});

app.listen(3679, () => console.log('Example app listening on port 3679!'));