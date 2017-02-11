  var xmldoc = require('xmldoc');
  var str = '';
  exports.timefunction = function() {
      var http = require('http');
      //setInterval(execute, 1000);

      http.get(options, callback).end();
  }
  var i = 0;

  function execute() {
      //code to execute

      i++;
      console.log(i);
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
              var result = arr[i].childNamed("description");
              if (result == "undefine") {} else {
                  var result1 = arr[i].childNamed("dc:date");
                  if (result1 == "undefine") {} else {
                      var time = "" + result1.val;
                      var final = time.substring(time.indexOf("T") + 1, time.indexOf("."));
                      console.log(final + " " + result.val);
                  }
              }
          }
      });
  }