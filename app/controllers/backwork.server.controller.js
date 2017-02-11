  var xmldoc = require('xmldoc');
  var http = require('http');
  var str = '';
  var arrayLastSent = []; //array that saves sent times
  exports.timefunction = function() {

      setInterval(execute, 60000);


  }
  var i = 0;

  function execute() {
      http.get(options, callback).end();
  }

  //The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
  var options = {
      host: 'www.ttc.ca',
      path: '/RSS/Service_Alerts/index.jsp'
  };

  callback = function(response) {


      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function(chunk) {
          str += chunk;
      });

      //the whole response has been recieved, so we just print it out here
      response.on('end', function() {
          // console.log(str);
          var document = new xmldoc.XmlDocument(str);

          var arr = document.childrenNamed("item");
          for (var i = 0; i < arr.length; i++) {
              var descriptionResult = arr[i].childNamed("description");
              if (descriptionResult == "undefine") {} else {
                  var description = descriptionResult.val;
                  var dateResult = arr[i].childNamed("dc:date");
                  if (dateResult == "undefine") {} else {
                      var dateResultString = "" + dateResult.val;
                      var timeFinal = dateResultString.substring(dateResultString.indexOf("T") + 1, dateResultString.indexOf("."));
                      var hourFinal = timeFinal.substring(0, timeFinal.indexOf(":"));
                      var affecting = "";
                      if (description.indexOf("Bus Routes") > 0) {
                          affecting = "Bus Routes";
                          /* }
                           else if (description.indexOf("Subway") > 0) {
                                                    affecting = "Subway";*/
                      } else {
                          affecting = "";
                      }
                      //send mail if...

                      if (hourFinal >= 06 && hourFinal <= 20) {
                          if (typeof arrayLastSent[i] === "undefined") {
                              arrayLastSent[i] = timeFinal;
                          } else {
                              if (arrayLastSent[i] != timeFinal) {
                                  arrayLastSent[i] = timeFinal;
                              }
                          }
                      }
                  }
              }
          }
      });
  }