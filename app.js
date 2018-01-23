'use strict';
let soap = require('soap');
let bodyParser = require('body-parser');
let express = require('express');
let app = express();
app.use(bodyParser.json());

function getData(stopId, response){
    let url = 'http://rtpi.dublinbus.ie/DublinBusRTPIService.asmx?wsdl';
    console.log(stopId);
    let args = {stopId: stopId};
    soap.createClient(url, function(err, client) {
        client.GetRealTimeStopData(args, function(err, result) {
            let res = result.GetRealTimeStopDataResult;
            if (res.diffgram){
                let data = res.diffgram.DocumentElement.StopData;
                let info = "The next buses are ";
                if(data.length == 1){
                    info = "The next bus is ";
                }
                for(let i = 0; i < data.length; i++){
                    let bus, num, dest, timeNow, timeArrival, diff;
                    bus = data[i];
                    num = bus.MonitoredVehicleJourney_PublishedLineName;
                    dest = bus.MonitoredVehicleJourney_DestinationName;
                    timeNow = Date.parse(bus.StopMonitoringDelivery_ResponseTimestamp);
                    timeArrival = Date.parse(bus.MonitoredCall_ExpectedArrivalTime);
                    diff = Math.floor((timeArrival - timeNow) / 1000 /60);
                    info += num + " to " + dest + " in " + diff + " minutes," +"\n<break time=\"500ms\"/>";
                }
                console.log(info);

                let body = {
                    speech:info,
                    displayText:info,
                    source: "DublinBus API"
                };
                response.setHeader('Content-Type', 'application/json');
                response.send(body);
            }
            else{
                response.status(500).send("Could not find stop");
            }
        });
    });
}

app.post('/', (req, res) => {
    console.log("Connection");
    if(req.body.result.parameters.number){
        getData(req.body.result.parameters.number, res);
    }
    else{

    }
});

app.listen(3679, () => console.log('Example app listening on port 3679!'));