// Initializes Game

//imports
const ui = new UI();
const utility = new Utility();
const client = new Client();

// GLOBAL VARIABLES
//canvas
const gameWidth = 1280;
const gameHeight = 800;

//scene
var currentScene;

//debug
var debugMode = false;
const depthDebug = 1000000;

//player
var clientID;

//runs when window loads
window.onload = function() {

    //game configuration
    var config = {
        gameTitle: 'Project Virtual Pond',
        gameVersion: 'InDev v0.0.1',
        type: Phaser.AUTO,
        scale: {
            parent: 'game-container',
            fullscreenTarget: 'game-container',
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
            resolution: window.devicePixelRatio,
            max: {
                width: gameWidth,
                height: gameHeight
            },
            width: gameWidth,
            height: gameHeight
        },
        render: {
            // pixelArt: true,
            antialiasGL: false
        },
        physics: {
            // arcade: {
            //     debug: true
            // },
            default: 'arcade'
        },
        dom: {
            createContainer: true
        },
        disableContextMenu: true,
        hidePhaser: true,
        hideBanner: true,
        // scene: [LilypadHopper]
        scene: [ Menu, Game, CharacterCreator ]
    };

    //init game
    game = new Phaser.Game(config);

    //version
    console.log('%c %c Project Virtual Pond - InDev v0.0.1', 'background: #64BEFF;', 'background: #000000;');
};