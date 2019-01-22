"use strict";

const mongoose = require('mongoose');


const artistSchema = new mongoose.Schema({
    //change type to relavent data later
    artistId: {
        type: String,
        required: false
    },
    artistName: {
        type: String,
        required: false
    },
    artistLink: {
        type: String,
        required: false
    }
});

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;
