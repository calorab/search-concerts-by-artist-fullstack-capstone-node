const User = require('./models/user');
const Artist = require('./models/artists');
const bodyParser = require('body-parser');
//CALEB - line 5 needed if line 6?
const config = require('./config');
const {CLIENT_ORIGIN} = require('./config');
const mongoose = require('mongoose');
const moment = require('moment');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const express = require('express');
const https = require('https');
const http = require('http');

var unirest = require('unirest');
var events = require('events');

const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin: CLIENT_ORIGIN
}));

//CALEB - is this where we connect front and back end?
app.use(express.static('public'));

mongoose.Promise = global.Promise;

// ---------------- RUN/CLOSE SERVER -----------------------------------------------------
let server;

function runServer(urlToUse) {
    return new Promise((resolve, reject) => {
        mongoose.connect(urlToUse, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(config.PORT, () => {
                console.log(`Listening on localhost:${config.PORT}`);
                resolve();
            })
                .on('error', err => {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
}

if (require.main === module) {
    runServer(config.DATABASE_URL).catch(err => console.error(err));
}

function closeServer() {
    return mongoose.disconnect().then(() => new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    }));
}


let getArtistFromSongkick = function (artistName) {
    let emitter = new events.EventEmitter();

    let options = {
        host: 'https://api.songkick.com',
        path: "/api/3.0/search/artists.json?apikey=ZOV7FltnOvfdD7o9&query=" + artistName,
        method: 'GET',
        headers: {
            'Content-Type': "application/json",
            'Port': 443
        }
    };

    https.get(options, function (res) {
        let body = '';
        res.on('data', function (chunk) {
            body += chunk;
            let jsonFormattedResults = JSON.parse(body);
            emitter.emit('end', jsonFormattedResults);
        });

    }).on('error', function (e) {

        emitter.emit('error', e);
    });
    return emitter;
};

//CALEB - update - local API endpont communicating with the external api endpoint
app.get('/songkick/:artistName', function (req, res) {


    //external api function call and response
    let searchReq = getArtistFromSongkick(req.params.artistName);

    //get the data from the first api call
    searchReq.on('end', function (item) {
        res.json(item);
    });

    //error handling
    searchReq.on('error', function (code) {
        res.sendStatus(code);
    });
});

let getConcertsFromSongkick = function (concerts) {
    let emitter = new events.EventEmitter();
    // ???
    let artistId;
    console.log(artistId)

    //CALEB - need to get artist_id from artist schema/getArtistFromSongkick response and set equal to artistId / concert may need to be "event" ??
    let options = {
        host: 'https://api.songkick.com',
        path: "/api/3.0/artists/" + artistId + "/calendar.json?apikey=ZOV7FltnOvfdD7o9",
        method: 'GET',
        headers: {
            'Content-Type': "application/json",
            'Port': 443
        }
    };

    https.get(options, function (res) {
        let body = '';
        res.on('data', function (chunk) {
            body += chunk;
            let jsonFormattedResults = JSON.parse(body);
            emitter.emit('end', jsonFormattedResults);
        });

    }).on('error', function (e) {

        emitter.emit('error', e);
    });
    return emitter;
};

//CALEB - update - local API endpont communicating with the external api endpoint
app.get('/songkick/:concerts', function (req, res) {


    //external api function call and response CALEB - possible should be req.params.artistId
    let searchReq = getConcertsFromSongkick(req.params.concerts);

    //get the data from the first api call
    searchReq.on('end', function (item) {
        res.json(item);
    });

    //error handling
    searchReq.on('error', function (code) {
        res.sendStatus(code);
    });

});

// GET -----------------------------------------
app.get('/songkick/:artists', function (req, res) {

    //external api function call and response
    let searchReq = getConcertsFromSongkick(req.params.artist);

    //get the data from the first api call
    searchReq.on('end', function (item) {
        res.json(item);
    });

    //error handling
    searchReq.on('error', function (code) {
        res.sendStatus(code);
    });
});

// -------------artist ENDPOINTS------------------------------------------------
// POST -----------------------------------------
// creating a new Artist CALEB - update for artist including schema
app.post('/artist/create', (req, res) => {
    let artistId = req.body.artistId;


    console.log(artistId);

    //external api function call and response
    let searchReq = getFromBarchart(artistId);

    //get the data from the first api call CALEB - is resultsPage per songkick correct to replace portfolioDetailsOutput and addedPortfolioDetailsOutput ???
    searchReq.on('end', function (resultsPage) {
        console.log(resultsPage);

        //After gettig data from API, save in the DB
        Investment.create({
            artistId: resultsPage.results.artist[0].id,
            artistName: resultsPage.results.artist[0].displayName,
            artistLink: resultsPage.results.artist[0].uri
        }, (err, resultsPage) => {
            console.log(resultsPage);
            if (err) {
                return res.status(500).json({
                    message: 'Internal Server Error'
                });
            }
            if (addedResultsPage) {
                return res.json(addedResultsPage);
            }
        });
    });

    //error handling
    searchReq.on('error', function (code) {
        res.sendStatus(code);
    });
});


// GET ------------------------------------
// accessing a single investment by id CALEB
app.get('/investment/:id', function (req, res) {
    Investment
        .findById(req.params.id).exec().then(function (investment) {
        return res.json(investment);
    })
        .catch(function (investment) {
        console.error(err);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    });
});



// ---------------USER ENDPOINTS-------------------------------------
// POST -----------------------------------
// creating a new user
app.post('/users/create', (req, res) => {

    //take the name, username and the password from the ajax api call
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;

    //exclude extra spaces from the username and password
    username = username.trim();
    password = password.trim();

    //create an encryption key
    bcrypt.genSalt(10, (err, salt) => {

        //if creating the key returns an error...
        if (err) {

            //display it
            return res.status(500).json({
                message: 'Internal server error'
            });
        }

        //using the encryption key above generate an encrypted pasword
        bcrypt.hash(password, salt, (err, hash) => {

            //if creating the ncrypted pasword returns an error..
            if (err) {

                //display it
                return res.status(500).json({
                    message: 'Internal server error'
                });
            }

            //using the mongoose DB schema, connect to the database and create the new user
            User.create({
                email,
                username,
                password: hash,
            }, (err, item) => {

                //if creating a new user in the DB returns an error..
                if (err) {
                    //display it
                    return res.status(500).json({
                        message: 'Internal Server Error'
                    });
                }
                //if creating a new user in the DB is succefull
                if (item) {

                    //display the new user
                    console.log(`User with email \`${email}\` created.`);
                    return res.json(item);
                }
            });
        });
    });
});

// signing in a user
app.post('/users/login', function (req, res) {

    //take the username and the password from the ajax api call
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    //using the mongoose DB schema, connect to the database and the user with the same email as above
    User.findOne({
        email: email
    }, function (err, items) {

        //if the there is an error connecting to the DB
        if (err) {

            //display it
            return res.status(500).json({
                message: "Internal server error"
            });
        }
        // if there are no users with that username
        if (!items) {
            //display it
            return res.status(401).json({
                message: "Not found!"
            });
        }
        //if the email is found
        else {

            //try to validate the password
            items.validatePassword(password, function (err, isValid) {

                //if the connection to the DB to validate the password is not working
                if (err) {

                    //display error
                    console.log('Could not connect to the DB to validate the password.');
                }

                //if the password is not valid
                if (!isValid) {

                    //display error
                    return res.status(401).json({
                        message: "Password Invalid"
                    });
                }
                //if the password is valid
                else {
                    //return the logged in user
                    console.log(`User with email \`${email}\` logged in.`);
                    return res.json(items);
                }
            });
        };
    });
});




// MISC ------------------------------------------
// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Not Found'
    });
});

exports.app = app;
exports.runServer = runServer;
exports.closeServer = closeServer;
