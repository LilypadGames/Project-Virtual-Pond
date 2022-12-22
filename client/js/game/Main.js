// Initializes Game

//modules
const emotes = new Emotes();
const utility = new Utility();
const globalUI = new GlobalUI();
const loadingScreen = new LoadingScreen();
const ui = new UI();
const client = new Client();

//game events
const events = new Events();
const ff22 = new FF22();

//global variables
var canvas = document.createElement('canvas');
const gameWidth = 1280;
const gameHeight = 800;
var currentScene;
var clientID;
var debugMode = false;
var globalData = {};

//game data
var itemData = {};
$.getJSON('../config/itemData.json', function (json) {
    itemData = json;
});

//local storage default game options
if (store.get('gameOptions.music.volume') === null)
    store.set('gameOptions.music.volume', 0.25);
if (store.get('gameOptions.ambience.volume') === null)
    store.set('gameOptions.ambience.volume', 0.3);
if (store.get('gameOptions.sfx.volume') === null)
    store.set('gameOptions.sfx.volume', 0.5);
if (store.get('gameOptions.showStreamChat') === null)
    store.set('gameOptions.showStreamChat', true);

//runs when window loads
window.onload = function () {
    //game configuration
    var config = {
        gameTitle: 'Project Virtual Pond',
        gameVersion: 'InDev v0.0.1',
        type: Phaser.CANVAS,
        scale: {
            parent: 'game-container',
            fullscreenTarget: 'game-container',
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            resolution: window.devicePixelRatio,
            max: {
                width: gameWidth,
                height: gameHeight,
            },
            width: gameWidth,
            height: gameHeight,
        },
        backgroundColor: ColorScheme.Blue,
        render: {
            // pixelArt: true,
            antialiasGL: false,
        },
        physics: {
            arcade: {
                debug: true
            },
            default: 'arcade',
        },
        dom: {
            createContainer: true,
        },
        audio: {
            disableWebAudio: true,
            noAudio: false,
        },
        plugins: {
            scene: [
                {
                    key: 'rexUI',
                    plugin: rexuiplugin,
                    mapping: 'rexUI',
                },
            ],
            global: [
                {
                    key: 'rexCover',
                    plugin: rexcoverplugin,
                    start: true,
                    mapping: 'rexCover',
                },
                {
                    key: 'rexSoundFade',
                    plugin: rexsoundfadeplugin,
                    start: true,
                    mapping: 'rexSoundFade',
                },
                {
                    key: 'rexInputText',
                    plugin: rexinputtextplugin,
                    start: true,
                    mapping: 'rexInputText',
                },
                {
                    key: 'rexRoundRectanglePlugin',
                    plugin: rexroundrectangleplugin,
                    start: true,
                    mapping: 'rexRoundRectangle',
                },
            ],
        },
        disableContextMenu: true,
        hidePhaser: true,
        hideBanner: true,
        scene: [
            Menu,
            Game,
            CharacterCreator,
            FF22DailySpin,
            FF22FrogShuffle,
            FF22EmoteMatch,
        ],
    };

    //init game
    game = new Phaser.Game(config);
    // window.focus();
};
