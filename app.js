'use strict';
let soap = require('soap');
let url = 'http://rtpi.dublinbus.ie/DublinBusRTPIService.asmx?wsdl';
let args = {stopId: 1234};
soap.createClient(url, function(err, client) {
    client.GetRealTimeStopData(args, function(err, result) {
        let res = result.GetRealTimeStopDataResult;
        if (res.diffgram){
            let data = res.diffgram.DocumentElement.StopData;
            for(let i = 0; i < data.length; i++){
                let bus, num, dest, timeNow, timeArrival, diff;
                bus = data[i];
                num = bus.MonitoredVehicleJourney_PublishedLineName;
                dest = bus.MonitoredVehicleJourney_DestinationName;
                timeNow = Date.parse(bus.StopMonitoringDelivery_ResponseTimestamp);
                timeArrival = Date.parse(bus.MonitoredCall_ExpectedArrivalTime);
                diff = Math.floor((timeArrival - timeNow) / 1000 /60);
                console.log(num + " to " + dest + " in " + diff + " minutes");
            }
        }
    });
});