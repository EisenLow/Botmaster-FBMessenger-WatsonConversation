const Botmaster = require('botmaster');
const MessengerBot = require('botmaster-messenger');

var watson = require('watson-developer-cloud');
var express = require('express')
const readline = require('readline');
const app = express()

var conversation = new watson.ConversationV1({
	username : '3c3e1393-36df-4327-8bbe-0b8cd7b27d28',
	password : 'QPsIu4aNGAY7',
	version_date : '2017-05-26'
});

/*conversation.listWorkspaces(function(err, response) {
	if (err) {
		console.error(err);
	} else {
		console.log(JSON.stringify(response, null, 2));
	}
});*/
/*conversation.message({
	workspace_id : '00eec2b2-f91a-4b20-b6e2-6abc9876ce65',
	input : {
		'text' : 'hello'
	}
}, function(err, response) {
	if (err)
		console.log('error:', err);
	else
		console.log(JSON.stringify(response, null, 2));
});*/

// const
  // express = require('express'),
  // bodyParser = require('body-parser'),
  // app = express().use(bodyParser.json()); // creates express http server

// const nemoServer = app.listen(3001);
// app.listen(() => console.log('webhook is listeningon port 3001'));
// Creates the endpoint for our webhook
// app.post('/webhook', (req, res) => {
//
//   let body = req.body;
//     // Checks this is an event from a page subscription
//     if (body.object === 'page') {
//
//       // Iterates over each entry - there may be multiple if batched
//       body.entry.forEach(function(entry) {
//
//         // Gets the message. entry.messaging is an array, but
//         // will only ever contain one message, so we get index 0
//         let webhook_event = entry.messaging[0];
//         console.log(webhook_event);
//       });
//
//       // Returns a '200 OK' response to all requests
//       res.status(200).send('EVENT_RECEIVED');
//     } else {
//       // Returns a '404 Not Found' if event is not from a page subscription
//       res.sendStatus(404);
//     }
// });

// Adds support for GET requests to our webhook
// app.get('/webhook', (req, res) => {
//
//   // Your verify token. Should be a random string.
//   let VERIFY_TOKEN = "nemogcc2018hackathon"
//
//   // Parse the query params
//   let mode = req.query['hub.mode'];
//   let token = req.query['hub.verify_token'];
//   let challenge = req.query['hub.challenge'];
//
//   // Checks if a token and mode is in the query string of the request
//   if (mode && token) {
//
//     // Checks the mode and token sent is correct
//     if (mode === 'subscribe' && token === VERIFY_TOKEN) {
//
//       // Responds with the challenge token from the request
//       console.log('WEBHOOK_VERIFIED');
//       res.status(200).send(challenge);
//
//     } else {
//       // Responds with '403 Forbidden' if verify tokens do not match
//       res.sendStatus(403);
//     }
//   }
// });

const messengerSettings = {
  credentials: {
    verifyToken: 'nemogcc2018hackathon',
    pageToken: 'EAADJtv2MShYBALvj3jSZCMb3Foh3L0cQLdvHuZAxKqzTX4XSny0kFgZCBou2rYd6STEUfuWt9WyYLXjkRYKJerQh3hysfZArj7OKmDPMQsddGr8TurUsgIA971DcuGI9AjtT8yQsvVInW3BYRcUkIiOcbjyvXnMIZAJXQYqPYqa6vatHMeaKR',
    fbAppSecret: 'ad1134638921363f25799f6b51b4d5eb'
  },
  webhookEndpoint: 'webhook',
};

const botmaster = new Botmaster();
botmaster.addBot(new MessengerBot(messengerSettings))
botmaster.use({
  type: 'incoming',
  name: 'my-incoming-middleware',
  controller: (bot, update) => {
    console.log(update);
    var response = replyFromWatson(bot, update, update.message.text)
    return null
  }
});

// TODO: Log the answer in a database
// console.log(`Thank you for your valuable feedback: ${answer}`);
function replyFromWatson(bot, update, input) {
  conversation.message({
    workspace_id : '00eec2b2-f91a-4b20-b6e2-6abc9876ce65',
    input : {
      'text' : input
    }
  }, function(err, response) {
  if (err)
    console.log('error:', err);
  else
    console.log(bot.reply(update, response.output.text[0]));
  });
}
