const mongoose = require('mongoose');

const setupSchema = new mongoose.Schema({
    _id: String,
    guildId: String,
    Gamerole: String,
    LogChannel: String,
});

const Setup = mongoose.model('Setup', setupSchema);

module.exports = Setup;
