exports.DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || 'mongodb://localhost:8080'

//exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||

exports.PORT = process.env.PORT || 8080;

//CALEB - move to REACT app?
module.exports = {
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000'
};



