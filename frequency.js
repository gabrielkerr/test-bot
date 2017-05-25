'use strict';

var restify = require('restify');
var builder = require('botbuilder');
var server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// setup bot credentials
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector);

var savedAddress;
var numWalks;
var totalWalks = 0;
var now = new Date();
var millisTill9 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0, 0, 0) - now;
var millisTill2 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0, 0, 0) - now;
var millisTill6 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0, 0, 0) - now;

if(millisTill9 < 0)
{
    millisTill9 += 86400000;
    millisTill2 += 86400000;
    millisTill6 += 86400000;
}


server.post('/api/messages', connector.listen());

// Do GET this endpoint to deliver a notification
server.get('/api/CustomWebApi', (req, res, next) => {
    sendProactiveMessage(savedAddress);
    res.send('triggered');
    next();
}
);

// root dialog
bot.dialog('/', [
        function (session) {
            builder.Prompts.number(session, "Hello! I'm here to help you walk more, how many walks would you like to get tomorrow?");
        },
        function (session, results) {
            numWalks = results.response;
            session.send("Sounds good! I will remember that and remind you throughout the day.");
            setTimeout(function() { session.beginDialog('/morning-dialog'); }, millisTill9);
        },
        function (session, results) {
            setTimeout(function() { session.beginDialog('/afternoon-dialog'); }, millisTill2);
        },
        function (session, results) {
            setTimeout(function() { session.beginDialog('/evening-dialog'); }, millisTill6);
        },
        function (session, results) {
            session.send("You made it through the entire day!");
        }
]);

bot.dialog('/morning-dialog', [
        function (session) {
            builder.Prompts.number(session, "Good morning! This is a friendly reminder that you wanted to get " + numWalks +  " walks today! How many have you gotten so far?");
        },
        function(session, results, next) {
            var walked = results.response;
            totalWalks = totalWalks + walked;
            // Give response according to number of walks taken.
            // Need to handle negative input.
            if(walked >= numWalks) {
                next();
            }
            else if(walked == 0) {
                session.send("Alright let's get started! Your first walk is only a short 5 minutes away.");
            }
            else if(walked <= 2) {
                session.send("Great start! To stay on track try to get another walk in the next hour.");
            }
            else if(walked <= 5) {
                session.send("You are getting close! Try for one more before noon.");
            }
            else if(walked >= 6) {
                session.send("You don't even need my help! You should hit your goal no problem.");
            }
            else
            {
                session.send("Wow, you got " + results.response + " walks!");
            }
            session.endDialogWithResult();
        },
        function (session, results) {
            session.send('Look! Next worked!');
            builder.Prompts.confirm(session, "You hit your goal! Want to set a new one?");
        },
        function (session, results) {
            if(results.response)
            {
                session.send("Great! New goal of +2 set!");
                session.endDialogWithResult();
            }
            else if(!results.response)
            {
                session.send("Sounds good! We will stick with your original goal.");
                session.endDialogWithResult();
            }
        }
]);

bot.dialog('/afternoon-dialog', [
        function (session) {
            builder.Prompts.number(session, "Hey just checking in, how many walks do you have so far?");
        },
        function(session, results) {
            var walked = results.response;
            totalWalks = totalWalks + walked;
            // Give response according to number of walks taken.
            // Need to handle negative input.
            if(totalWalks >= numWalks) {
                session.beginDialog('/set-new-goal');
            }
            else if(walked == 0) {
                session.send("Alright let's get started! Your first walk is only a short 5 minutes away.");
            }
            else if(walked <= 2) {
                session.send("Great start! To stay on track try to get another walk in the next hour.");
            }
            else if(walked <= 5) {
                session.send("You are getting close! Try for one more before noon.");
            }
            else if(walked >= 6) {
                session.send("You don't even need my help! You should hit your goal no problem.");
            }
            else
            {
                session.send("Wow, you got " + results.response + " walks!");
            }
            session.endDialogWithResult();
        }
]);

bot.dialog('/evening-dialog', [
        function (session) {
            builder.Prompts.number(session, "Let's see how you did on your goal, how many walks did you get today?");
        },
        function (session, results) {
            var walked = results.response;
            totalWalks = totalWalks + walked;

            if(totalWalks >= numWalks)
            {
               session.beginDialog('/set-new-goal');
               session.endDialogWithResult();
            }
            else
            {
               session.beginDialog('/missed-goal');
               session.endDialogWithResult();
            }
        }
]);

bot.dialog('/set-new-goal', [
        function (session) {
            builder.Prompts.confirm(session, "You hit your goal! Want to set a new one?");
        },
        function (session, results) {
            if(results.response == true)
            {
                session.send("Great! New goal of +2 set!");
                session.endDialogWithResult();
            }
            else if(results.response == false)
            {
                session.send("Sounds good! We will stick with your original goal.");
                session.endDialogWithResult();
            }
        }
]);

bot.dialog('/missed-goal', [
        function(session) {
            builder.Prompts.confirm(session, "You didn't quite hit your goal today. Should we drop your goal for tomorrow?");
        },
        function(session, results) {
            if(results.response == false)
            {
                session.send("Alright then, same goal again tomorrow!");
                session.endDialogWithResult();
            }
            else if(results.response == true)
            {
                numWalks = numWalks - 1;
                session.send("Okay, your new goal for tomorrow is " + numWalks + " walks.");
                session.endDialogWithResult();
            }

            totalWalks = 0;
        }
]);
