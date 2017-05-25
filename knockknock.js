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

var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/07f2c1c4-3213-4f81-9fea-e4711eb10e6c?subscription-key=fc7108cd0d074d50965355f8ca535143&verbose=true&timezoneOffset=-420&q=');
bot.recognizer(recognizer);

//=========================================================
// Bots Dialogs
//=========================================================

//bot.Dialog

bot.dialog('/', [
        function (session) {
            builder.Prompts.text(session, "Knock knock!");
        },
        function(session, results, args){
            var resp = results.response;
            if(resp != "who's there?" || resp != "Who's there?" || resp != "who's there" || resp != "Who's there") {
                session.send("Aw man, you didn't say who's there! Joke's ruined. Bye!");
                session.endDialog();
            }
            else {
                builder.Prompts.text(session, "Broken pencil.");
            }
        },
        function(session, results) {
            var resp = results.response;

            if(resp != "Broken pencil who?") {
                session.send("You're not playing! Sad day. Catch ya later :P");
                session.endDialog();
            }
            else {
                builder.Prompts.text(session, "Nevermind. This joke is pointless.");
            }
        },
        function(session, results) {
            session.send("BAHAHA! Good one wasn't it? See ya later!");
        }
]);

bot.dialog('/WhoThere', [
    function (session) {
        session.send("Hey who's there!? ;)");
    }
]);
