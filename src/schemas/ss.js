// In schemas/ss.js
const mongoose = require('mongoose');

// Define the game schema
const gameSchema = new mongoose.Schema({
    _id: String,
    host: String,
    prize: String,
    duration: Number,
    channel: String,
    players: [String],
    playerChoices: [{
        userId: String,
        choice: String,
    }],
    extraJoins: [String],
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
