require('dotenv').config();

const Botmaster = require('botmaster');
const MessengerBot = require('botmaster-messenger');
var watson = require('watson-developer-cloud');
var request = require('request');
var express = require('express')
const readline = require('readline');
const fs = require('fs');
const converter = require('video-converter');
var ffmpeg = require('ffmpeg');

converter.setFfmpegPath("libs/ffmpeg", function(err) {
  if (err)
    throw err;
  }
);

const app = express()
var port = process.env.PORT || 3000
const myServer = app.listen(port, function() {
  console.log("Listening..");
});

var stt = new watson.SpeechToTextV1({"username": process.env.TEXT_TO_SPEECH_USERNAME, "password": process.env.TEXT_TO_SPEECH_PASSWORD})

function getSttParams() {
  console.log("AUDIOURL:");
  return {
    audio: fs.createReadStream('voiceNote.mp3'),
    content_type: 'audio/mp3',
		model: 'en-US_NarrowbandModel',
		content_type: 'audio/mp3',
		'interim_results': true,
		keywords_threshold: 0.3,
		keywords: ['Nemo'],
		timestamps: true
	}
}

function saveAudioFile(audioUrl) {}

var conversation = new watson.ConversationV1({username: process.env.WATSON_CONVERSATION_USERNAME, password: process.env.WATSON_CONVERSATION_PASSWORD, version_date: '2017-05-26'});

const messengerSettings = {
  credentials: {
    verifyToken: process.env.FACEBOOK_VERIFY_TOKEN,
    pageToken: process.env.FACEBOOK_PAGE_TOKEN,
    fbAppSecret: process.env.FACEBOOK_APP_SECRET
  },
  webhookEndpoint: 'webhook'
};

// BOT incoming message middleware
const botmaster = new Botmaster({server: myServer});
botmaster.addBot(new MessengerBot(messengerSettings))
botmaster.use({
  type: 'incoming',
  name: 'my-incoming-middleware',
  controller: (bot, update) => {
    if (update.message.attachments) {
      replyFromSpeechToText(bot, update);
      console.log(JSON.stringify(update, null, 2));
      return null
    } else {
      console.log("Fb user message: " + update.message.text + "\n");
      var response = replyFromWatson(bot, update, update.message.text);
      return null
    }
  }
});

function replyFromSpeechToText(bot, update) {
  if (update.message.attachments) {
    console.log("Getting attachment...\n" + JSON.stringify(update.message.attachments, null, 2));
    var audioUrl = update.message.attachments[0].payload.url;
    // Get the audio file
    var stream = request(audioUrl).on('response', function(response) {
      console.log(response.statusCode) // 200
      console.log(response.headers['content-type']) // 'image/png'
    }).pipe(fs.createWriteStream('voiceNote.mp4'));
    stream.on('finish', function() {
      // Audio file is saved locally, now construct the params for Watson request

      // convert mp4 to mp3

      // convert mp4 to mp3
      converter.convert("voiceNote.mp4", "voiceNote.mp3", function(err) {
        if (err)
          throw err;
        console.log("done");

        var params = getSttParams();
        console.log("Params:" + JSON.stringify(params, null, 2));
        stt.recognize(params, function(error, transcript) {
          if (error)
            console.log('Error RECEIVED:', JSON.stringify(error, null, 2));
          else
            console.log(transcript);
          }
        );
      });
      // try {
      //   var process = new ffmpeg('voiceNote.mp4');
      //   process.then(function(video) {
      //     // Callback mode
      //     video.fnExtractSoundToMP3('voiceNote.mp3', function(error, file) {
      // 			console.log(error);
      //       if (!error) {
      //         console.log('Audio file: ' + file);
      //         var params = getSttParams();
      //         console.log("Params:" + JSON.stringify(params, null, 2));
      //         stt.recognize(params, function(error, transcript) {
      //           if (error)
      //             console.log('Error RECEIVED:', JSON.stringify(error, null, 2));
      //           else
      //             console.log(JSON.stringify(transcript, null, 2));
      //           });
      //       } else {
      //         console.log('Error:');
      //       }
      //     });
      //   }, function(err) {
      //       	console.log('Error: ' + err);
      //   		});
      //   } catch (e) {
      // 			console.log(e.code);
      // 			console.log(e.msg);
      // 	}
    });
  }
}

// TODO: Log the answer in a database
// console.log(`Thank you for your valuable feedback: ${answer}`);
function replyFromWatson(bot, update, input) {
  conversation.message({
    workspace_id: process.env.WATSON_WORKSPACE_ID,
    input: {
      'text': input
    }
  }, function(err, response) {
    if (err)
      console.log('error:', err);
    else
      bot.reply(update, response.output.text[0]);
    console.log("Nemo responds: " + response.output.text[0] + "\n");
  });
}
