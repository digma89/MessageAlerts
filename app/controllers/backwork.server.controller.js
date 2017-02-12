  var xmldoc = require('xmldoc');
  var http = require('http');
  var str = '';
  var arrayLastSent = []; //array that saves sent times
  exports.timefunction = function() {

      setInterval(execute, 10000);

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
                          affecting = "Bus";
                      } else if (description.indexOf("Subway") > 0) {
                          affecting = "Subway";
                      } else if (description.indexOf("System Wide Alert") > 0) {
                          affecting = "Wide Alert";
                      } else {
                          affecting = "";
                      }
                      //send mail if...

                      if (hourFinal >= 06 && hourFinal <= 20) {
                          var body = {
                              time: timeFinal,
                              aff: affecting,
                              desc: description
                          }
                          if (typeof arrayLastSent[i] === "undefined") {
                              //sendMail(body);
                              arrayLastSent[i] = timeFinal;
                              console.log(body.time + " " + body.aff);
                          } else {
                              if (arrayLastSent[i] != timeFinal) {
                                  //sendMail(body);
                                  arrayLastSent[i] = timeFinal;
                                  console.log(body.time + " " + body.aff);
                              }
                          }
                      }
                  }
              }
          }
      });
  }

  /**inputName
   * inputEmail
   * inputSubject
   * inputMessage
   * Send an email when the contact from is submitted
   
  function sendMail(data) {
      console.log("from send mail: " + data.aff + data.desc + data.time);
      var nodemailer = require('nodemailer');
      var mg = require('nodemailer-mailgun-transport');
      // This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
      var auth = {
          auth: {
              api_key: 'key-b2d52c4ec4e4f669aa319ba1b357ec11',
              domain: 'sandbox7c03b0486de94c0299782e6f4b4563bf.mailgun.org'
          }
      }
      var transporter = nodemailer.createTransport(mg(auth));

      var mailOptions = {
          from: "DInfo@d.ca",
          to: '6475197344@txt.freedommobile.ca',
          subject: data.aff,
          text: data.desc
      };

      transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
              console.log("mail sent");
              // res.send('error');
              // return console.log(error);
          } else {
              console.log("error");
              // res.send('sent');
          }

      });
  };
*/



  sendMail = function(data) {
      console.log("entro")
          //Include the wrapper
      var reachmail = require('reachmailapi');

      //inialize the wrapper to the variable api using a token generated from the User Interface at https://go.reachmail.net
      var api = new reachmail({ token: 'OiYEb2t8nRPaaXSHUk5vw-AJh0C1TzJyijKXkX2C0DWsYea4joUSoJqcYAPihcA2' });
      //The following builds the content of the message
      var body = {
          FromAddress: 'd@info.ca',
          Recipients: [{
                  Address: '6475197344@txt.freedommobile.ca'
              },
              /* {
                   Address: 'rcpt2@domain.tld'
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
      //JSON encode the message body for transmission
      jsonBody = JSON.stringify(body);

      /* 
      The function below retreieves the account GUID. Only when succefful will the 
      function proceed to them schedule the message for delivery.
      Information is printed to screen through the use of console.log(...)
      */
      api.get('/administration/users/current', function(http_code, response) {
          if (http_code === 200) {
              AccountId = response.AccountId; //extracts account GUID from response obj
              // console.log("Success!  Account GUID: " + AccountId); //prints out the Account GUID
              //Next Function sends the message
              api.easySmtpDelivery(AccountId, jsonBody, function(http_code, response) {
                  if (http_code === 200) {
                      //   console.log("successful connection to EasySMTP API");
                      //  console.log(response);
                  } else {
                      // console.log("Oops, looks like an error on send. Status Code: " + http_code);
                      // console.log("Details: " + response);
                  }
              });
          } else {
              //  console.log("Oops, there was an error when trying to get the account GUID. Status Code: " + http_code);
              // console.log("Details: " + response);
          }
      });
  }