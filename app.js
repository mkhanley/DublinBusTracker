"use strict";
let soap = require("soap");
let bodyParser = require("body-parser");
let express = require("express");
let app = express();
app.use(bodyParser.json());

function extractData(bus){
    let num, dest, timeNow, timeArrival, diff;
    num = bus.MonitoredVehicleJourney_PublishedLineName;
    dest = bus.MonitoredVehicleJourney_DestinationName;
    timeNow = Date.parse(bus.StopMonitoringDelivery_ResponseTimestamp);
    timeArrival = Date.parse(bus.MonitoredCall_ExpectedArrivalTime);
    diff = Math.floor((timeArrival - timeNow) / 1000 /60);
    return num + " to " + dest + " in " + diff + " minutes," +"\n";
}

function getData(stopId, response){
    let url = "http://rtpi.dublinbus.ie/DublinBusRTPIService.asmx?wsdl";
    console.log(stopId);
    let args = {stopId: stopId};
    soap.createClient(url, function(err, client) {
        client.GetRealTimeStopData(args, function(err, result) {
            let res = result.GetRealTimeStopDataResult;
            let info = "The next buses are ";
            if (res.diffgram){
                let data = res.diffgram.DocumentElement.StopData;
                if(Array.isArray(data)){
                    for(let i = 0; i < data.length; i++){
                        info += extractData(data[i])
                    }
                }
                else{
                    info = "The next bus is ";
                    info += extractData(data)
                }
                console.log(info);
            }
            else{
                info = "Oh no. I could not find any buses for stop " + stopId;
            }
            let body = {
                speech:info,
                displayText:info,
                source: "DublinBus API"
            };
            response.setHeader("Content-Type", "application/json");
            response.send(body);
        });
    });
}

app.post("/", (req, res) => {
    console.log("Connection");
    if(req.body.result.parameters.number){
        getData(req.body.result.parameters.number, res);
    }
    else{

    }
});

app.listen(3679, () => console.log("Example app listening on port 3679!"));