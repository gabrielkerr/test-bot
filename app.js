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

bot.Dialog

bot.dialog('/', [
    function (session) {
      builder.Prompts.text(session, "Hi there! What is your name?");
    },
    function(session, results){
      session.send("Why hello " + results.response + "!");
      builder.Prompts.number(session, " I can send you an army of robots to do your bidding. How many robots would you like?");
    },
    function(session, results){
      session.send("And " + results.response + " robots you shall receive!");
      builder.Prompts.choice(session, "Your robot army can do one of three things. Pick which programming will best fit your purposes.", "Build|Destroy|Save the World|Hand out Ice Cream");
    },
    function(session, results){
      session.send("A wise choice! Your robot army will be built to " + results.response.entity + ".");
      builder.Prompts.time(session, "What time would you like your robot army to arrive?");
    },
    function(session, results){
      session.send("Your army shall arrive promptly at " + results.response +  "!");
      builder.Prompts.confirm(session, "Thank you for your request! Will you require another army in the future?");
    },
    function(session, results){
      session.send(results.response);
      if(results.response == 'confirm_yes')
      {
        session.send("Great! I'm looking forward to seeing you again!");
      }
      else(results.response == 'confirm_no')
      {
        session.send("No? Well I hope you had a good experience!");
      }
    }
]);


/*  builder.Prompts.choice(session, "Which color?", "red|green|blue")
},
  function(session, results){
    if(results.response){
      session.send("I love " + results.response.entity + " too!");
    }
  }*/


