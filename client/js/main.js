// Initializes Game

//scenes
import * as Game from './scene/game.js';

//config
var config = {
    width: 24*32,
    height: 17*32,
    scene: [ Game ]
};

//set up game
var game = new Phaser.Game(config);