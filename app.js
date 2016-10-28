var builder = require('botbuilder');
var restify = require('restify');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
var connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector, {
  localizerSettings: {
    botLocalePath: "./locale",
    defaultLocale: "en"
  }
});
server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [function (session) {
  builder.Prompts.choice(session, "Which color?", "red|green|blue")
},
  function(session, results){
    if(results.response){
      session.send("I love " + results.response + " too!");
    }
  }

]);
