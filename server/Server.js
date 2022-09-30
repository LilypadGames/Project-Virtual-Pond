// Handles web app, authentication, and websockets

//dependency: file parsing
const fs = require('fs');
const path = require('path');
var util = require('util');

//get config values
const config = JSON.parse(
    fs.readFileSync(path.join(__dirname, '/config/config.json'))
);

//environment settings
process.env.NODE_ENV = config.production ? 'production' : 'development';

//modules
const utility = require(path.join(__dirname, '/module/Utility.js'));
const ConsoleColor = require(path.join(__dirname, '/module/ConsoleColor.js'));
const database = require(path.join(__dirname, '/module/Database.js'));
const logs = require(path.join(__dirname, '/module/Logs.js'));

//dependency: web server
var express = require('express');
var session = require('express-session');
var cors = require('cors');

//init web server
var app = express();
var server = require('http').Server(app);
// var SSL = {
//     key: fs.readFileSync('/config/agent2-key.pem'),
//     cert: fs.readFileSync('/config/agent2-cert.cert')
// };
// var server = require('https').createServer(options, app);

//dependency: authentication
var passport = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var request = require('request');

//dependency: misc
var cookieParse = require('cookie-parser')();
const crypto = require('crypto');

//enable cross origin requests
app.use(cors());

//proxy setting
app.set('trust proxy', config.server.proxy);

//serve client files (html/css/js/assets)
app.use('/', express.static(__dirname + '/../client'));

// OVERRIDES
//send console logs to server log file
console.log = function () {
    //format message
    const message = util.format.apply(null, arguments);

    //write to log
    logs.logMessage('server', message);
    logs.logMessage('debug', message);
    process.stdout.write(message + '\n');
};
console.error = console.log;

// AUTHENTICATION
//init authentication
const sessionAuthentication = session({
    secret: crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false,
    proxy: config.server.proxy,
});
const passportInit = passport.initialize();
const passportSession = passport.session();
app.use(sessionAuthentication);
app.use(passportInit);
app.use(passportSession);

//override passport profile function to get user profile from Twitch API
OAuth2Strategy.prototype.userProfile = function (accessToken, done) {
    var options = {
        url: 'https://api.twitch.tv/helix/users',
        method: 'GET',
        headers: {
            'Client-ID': config.twitch.clientID,
            Accept: 'application/vnd.twitchtv.v5+json',
            Authorization: 'Bearer ' + accessToken,
        },
    };
    request(options, function (error, response, body) {
        if (response && response.statusCode == 200) {
            done(null, JSON.parse(body));
        } else {
            done(JSON.parse(body));
        }
    });
};

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

//CRASH ISSUE
passport.use(
    'twitch',
    new OAuth2Strategy(
        {
            authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
            tokenURL: 'https://id.twitch.tv/oauth2/token',
            clientID: config.twitch.clientID,
            clientSecret: config.twitch.clientSecret,
            callbackURL: config.twitch.callbackURL,
            state: true,
        },

        async function (accessToken, refreshToken, profile, done) {
            profile.accessToken = accessToken;
            profile.refreshToken = refreshToken;

            //store users name and ID in database
            var path = 'users/' + profile.data[0].id + '/name';
            const pathExists = await database.pathExists(path);
            if (!pathExists) {
                database.setValue(path, profile.data[0].display_name);
            }

            done(null, profile);
        }
    )
);

//set route to start OAuth link, this is where you define scopes to request
app.get(
    '/auth/twitch',
    passport.authenticate('twitch', { scope: 'user_read' })
);

//set route for OAuth redirect
app.get(
    '/auth/twitch/callback',
    passport.authenticate('twitch', {
        successRedirect: '/',
        failureRedirect: '/',
    })
);

//detect authentication and serve game page
app.get('/', function (req, res) {
    //successfully authenticated
    if (
        (req.session && req.session.passport && req.session.passport.user) ||
        config.server.bypassAuth
    ) {
        res.sendFile('game.html', { root: 'client/html' });
    }

    //request authentication
    else {
        res.sendFile('auth.html', { root: 'client/html' });
    }
});

//logout
app.get('/logout', function (req, res) {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

// WEB SERVER
//init web server
server.listen(process.env.PORT || config.server.port, function () {
    console.log(
        ConsoleColor.Blue,
        utility.timestampString(
            'Web Server Initialized> Port: ' + server.address().port
        )
    );
});

// DEBUG
process.on('warning', (e) => console.warn(e.stack));

// WEBSOCKETS
//dependency: websocket
var io = require('socket.io')(server);
const { instrument } = require('@socket.io/admin-ui');

//authentication
instrument(io, {
    auth: {
        type: config.socketio_admin_dash.auth.type,
        username: config.socketio_admin_dash.auth.username,
        password: require('bcrypt').hashSync(
            config.socketio_admin_dash.auth.password,
            10
        ),
    },
});
io.use((socket, next) => {
    socket.client.request.originalUrl = socket.client.request.url;
    cookieParse(socket.client.request, socket.client.request.res, next);
});
io.use((socket, next) => {
    socket.client.request.originalUrl = socket.client.request.url;
    sessionAuthentication(
        socket.client.request,
        socket.client.request.res,
        next
    );
});
io.use((socket, next) => {
    passportInit(socket.client.request, socket.client.request.res, next);
});
io.use((socket, next) => {
    passportSession(socket.client.request, socket.client.request.res, next);
});

//log
console.log(
    ConsoleColor.Blue,
    utility.timestampString(
        'Websockets Initialized> Authentication: ' +
            (config.server.bypassAuth ? 'DISABLED' : 'ENABLED')
    )
);

//set up temp user ID if auth mode is disabled
if (config.server.bypassAuth) {
    io.guestID = 0;
}

//init chat log storage
const chatLogs = require(path.join(__dirname, '/module/ChatLogs.js'));
chatLogs.init(io);

//init emotes
const emotes = require(path.join(__dirname, '/module/Emotes.js'));
(async () => {
    await emotes.init('pokelawls');
})();

//init global data
const globalData = require(path.join(__dirname, '/module/GlobalData.js'));
globalData.init(io);

//init twitch event subs
// const twitch = require(path.join(__dirname, '/module/Twitch.js'));
// twitch.init('pokelawls', app, globalData);

//init donations
// streamElements.init();
const streamElements = require(path.join(
    __dirname,
    '/module/StreamElements.js'
));
streamElements.updateDonations();

//import connection event
const Connection = require(path.join(__dirname, '/event/Connection.js'));

//on new websocket connection
io.on('connection', async function (socket) {
    const connection = new Connection(io, socket);
    await connection.init();
});

// // Start Game Logic
// const GameLogic = new (require(path.join(__dirname, 'GameLogic.js')))(io);
// GameLogic.init();
