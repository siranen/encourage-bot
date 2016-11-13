/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node slack_bot.js

# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

  Say: "who are you?"

  The bot will tell you its name, where it is running, and for how long.

  Say: "Call me <nickname>"

  Tell the bot your nickname. Now you are friends.

  Say: "who am I?"

  The bot will tell you your nickname, if it knows one for you.

  Say: "shutdown"

  The bot will ask if you are sure, and then shut itself down.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./lib/Botkit.js');
var os = require('os');
var when = require('when');

var controller = Botkit.slackbot({
    debug: false,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

controller.hears(['flag'], 'direct_message', function(bot, message) {
    sendFlaggedMessageToAdmin(bot, message);
    bot.reply(message, "I'll notify the team's admin that the last message was inappropriate.");
});

function getAdminUsers() {
    var admin_users = [];
    bot.api.users.list({}, function (err, response) {
       if (response.hasOwnProperty('members') && response.ok) {
           var members = response.members;
           for (var i = 0; i < members.length; i++) {
                if (members[i].is_admin) {
                    admin_users.push(members[i]);
                }
            }

       }
   });
  return admin_users;
}

function sendFlaggedMessageToAdmin(bot, message) {
    // var admin_users = when(getAdminUsers).then(function(message) {
    //     sendAdminMessage(admin_users, message);
    // }).catch(console.error);

    var admin_users = getAdminUsers();
    setTimeout(function(){ sendAdminMessage(admin_users, message)},1000);
}

function sendAdminMessage(admin_users, message) {
    for (var i = 0; i < admin_users.length; i++) {
        var user = admin_users[i];
        bot.api.im.open({
            user: user.id
        }, (err, res) => {
            if (err) {
                bot.botkit.log('Failed to open IM with user', err)
            }
            console.log(res);
            bot.startConversation({
                user: user.id,
                channel: res.channel.id,
            }, (err, convo) => {
                convo.say("Just so you know, <@" + message.user + "> flagged a message as inappropriate. Please investigate.");
            });
        })
    }
}

function sendEncouragement(bot, username, encouragement) {
   bot.api.im.open({
        user: username
    }, (err, res) => {
        if (err) {
            bot.botkit.log('Failed to open IM with user', err)
        }
        console.log(res);
        bot.startConversation({
            user: username,
            channel: res.channel.id,
        }, (err, convo) => {
            convo.say(encouragement);
        });
    })
}

controller.hears(['tell @*'], 'direct_message', function(bot, message) {
    var username = getUsername(message.text);
    var encouragement = getEncouragement(message.text);
    sendEncouragement(bot, username, encouragement);
});

function getUsername(message) {
    var arr = message.split(" ");
    var username = arr[1];
    username = username.toString();
    username = username.replace('@', '');
    username = username.replace('<', '');
    username = username.replace('>', '');
    return username;
}

function getEncouragement(encouragement) {
    var arr = encouragement.split(" ");
    arr.splice(0, 2);
    return arr.join(' ');
}

controller.hears(['pepper'], 'direct_message,direct_mention,ambient', function(bot, message) {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'hot_pepper',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });
    bot.reply(message, "That's my name!!");
});

controller.hears(['help'], 'direct_message', function(bot, message) {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'hatched_chick',
    });
    bot.reply(message, "Hi! I'm Pepper the Pepbot! It seems you've asked for help- let me tell you about some of the things that I can do! \n \n Every week, I will send you the name of a coworker. \n Reply to me ASAP so that I can send along your positive compliment along anonymously to that coworker. \n The format must be like this: tell @jess you are awesome to work with! \n \n If you receive an appropriate anonymous message from me, just reply with a message including the words flag, and I will notify the administrator of your slack channel so that they can look into who sent you the message :)");
});

controller.hears(['party'], 'direct_message,direct_mention,ambient', function(bot, message) {
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'hot_pepper',
    });
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'ghost',
    });
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'confetti_ball',
    });
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'birthday',
    });
    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'lollipop',
    });
    bot.reply(message, "It's party time!!!!!");
});

controller.hears(['hello', 'hi', 'hey', 'yo'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hiya :)');
        }
    });
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function(err, id) {
            bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['what is my name', 'who am i'], 'direct_message,direct_mention,mention', function(bot, message) {

    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Your name is ' + user.name);
        } else {
            bot.startConversation(message, function(err, convo) {
                if (!err) {
                    convo.say('I do not know your name yet!');
                    convo.ask('What should I call you?', function(response, convo) {
                        convo.ask('You want me to call you `' + response.text + '`?', [
                            {
                                pattern: 'yes',
                                callback: function(response, convo) {
                                    // since no further messages are queued after this,
                                    // the conversation will end naturally with status == 'completed'
                                    convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function(response, convo) {
                                    // stop the conversation. this will cause it to end with status == 'stopped'
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function(response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);

                        convo.next();

                    }, {'key': 'nickname'}); // store the results in a field called nickname

                    convo.on('end', function(convo) {
                        if (convo.status == 'completed') {
                            bot.reply(message, 'OK! I will update my dossier...');

                            controller.storage.users.get(message.user, function(err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function(err, id) {
                                    bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                                });
                            });



                        } else {
                            // this happens if the conversation ended prematurely for some reason
                            bot.reply(message, 'OK, nevermind!');
                        }
                    });
                }
            });
        }
    });
});

controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function(bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        bot.reply(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
             '>. I have been running for ' + uptime + ' on ' + hostname + '.');

    });

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}
