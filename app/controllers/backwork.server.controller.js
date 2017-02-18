var xmldoc = require('xmldoc');
var http = require('http');
var arrayLastSent = []; //array that saves sent times
var options = {
    host: 'www.ttc.ca',
    path: '/RSS/Service_Alerts/index.jsp'
};
var AccountId = "3c27e6ec-915e-42bd-84d9-a71800f47c85";
var interval;
var startStop = 0;

exports.timefunction = function (req, res) {
    if (startStop === 0) {
        interval = setInterval(execute, 120000);
        startStop = 1;
    } else {
        clearInterval(interval);
        startStop = 0;
    }
    res.render('index', {
        title: "test page1"
    })
}

function execute() {
    console.log("execute");
    http.get(options, callback).end();
}

callback = function (response) {
    console.log("start callback");
    var str = '';
    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
        str += chunk;
    });
    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
        var document = new xmldoc.XmlDocument(str);
        var arr = document.childrenNamed("item");
        console.log("start callback2");
        /* The function below retreieves the account GUID. Only when succefful will the 
        function proceed to them schedule the message for delivery. */
        var reachmail = require('reachmailapi');
        var api = new reachmail({
            token: 'OiYEb2t8nRPaaXSHUk5vw-AJh0C1TzJyijKXkX2C0DWsYea4joUSoJqcYAPihcA2'
        });
        /*api.get('/administration/users/current', function (http_code, response) {
            if (http_code === 200) {
                AccountId = response.AccountId; //extracts account GUID from response obj
                console.log("Success!  Account GUID: " + AccountId); //prints out the Account GUID */


        console.log("i: " + arr.length);
        for (var i = 0; i < arr.length; i++) {
            /***************PARSE DATA******************/
            var descriptionResult = arr[i].childNamed("description");
            if (descriptionResult === "undefine" || typeof descriptionResult === "undefined") {} else {
                var description = descriptionResult.val;
                var dateResult = arr[i].childNamed("dc:date");
                if (dateResult == "undefine" || typeof dateResult === "undefined") {} else {
                    var dateResultString = "" + dateResult.val;
                    var timeFinal = dateResultString.substring(dateResultString.indexOf("T") + 1, dateResultString.indexOf("."));
                    var hourFinal = timeFinal.substring(0, timeFinal.indexOf(":"));
                    var affecting = "";
                    if (description.indexOf("Bus Routes") > 0) {
                        affecting = "Bus";
                    } else if (description.indexOf("Subway") > 0) {
                        affecting = "Subway";
                    } else if (description.indexOf("System Wide Alert") > 0) {
                        affecting = "Wide Alert";
                    } else if (description.indexOf("Streetcar Routes") > 0) {
                        affecting = "Streetcar";
                    } else {
                        affecting = "";
                    }

                    //send mail if...
                    if (hourFinal >= 06 && hourFinal <= 20 && affecting != "Wide Alert") {
                        var data = {
                            time: timeFinal,
                            aff: affecting,
                            desc: description
                        }
                        console.log("hour:" + hourFinal + "aff:" + data.aff);
                        //The following builds the content of the message
                        var body = {
                            FromAddress: 'd@info.ca',
                            Recipients: [{
                                    Address: '6475197344@txt.freedommobile.ca'
                                          }
                                /*,
                                                                {
                                                                    Address: '6477834925@txt.freedommobile.ca'
                                                                           }*/
                                      ],
                            Headers: {
                                Subject: data.aff,
                                From: 'From Name <d@alert.ca>',
                                'X-Company': 'Company Name',
                                'X-Location': 'Your Location Header'
                            },
                            BodyText: data.desc,
                            //  BodyHtml: 'this is the HTML version of the ES API test',
                            Tracking: true
                        };
                        jsonBody = JSON.stringify(body);
                        //if is the first time you send info
                        if (typeof arrayLastSent[i] === "undefined") {
                            //Next Function sends the message
                            api.easySmtpDelivery(AccountId, jsonBody, function (http_code, response) {
                                if (http_code === 200) {
                                    console.log("Message sent new");
                                } else {
                                    console.log("Error, details: " + response);
                                }
                            });
                            arrayLastSent[i] = timeFinal;
                        } else {
                            if (arrayLastSent[i] != timeFinal) {
                                //Next Function sends the message
                                api.easySmtpDelivery(AccountId, jsonBody, function (http_code, response) {
                                    if (http_code === 200) {
                                        console.log("Message sent");
                                    } else {
                                        console.log("Error, details: " + response);
                                    }
                                });
                                arrayLastSent[i] = timeFinal;
                            }
                        }
                    }
                }
            }
        }
        /*} else {
                //  console.log("Oops, there was an error when trying to get the account GUID. Status Code: " + http_code);
                console.log("Error details: " + response);
            }
        });*/
    });
}
