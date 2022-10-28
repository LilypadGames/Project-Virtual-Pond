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
// var roomData = {};
var itemData = {};
$.getJSON('../config/itemData.json', function (json) {
    itemData = json;
});

//cookies
var gameOptions = JSON.parse(localStorage.getItem('gameOptions'));
const defaultOptions = [
    { id: 'music', volume: 0.5 },
    { id: 'ambience', volume: 0.5 },
    { id: 'sfx', volume: 1 },
];
if (
    gameOptions === null ||
    gameOptions.length <= 0 ||
    gameOptions.length != defaultOptions.length
) {
    localStorage.setItem('gameOptions', JSON.stringify(defaultOptions));
    gameOptions = defaultOptions;
}
var gameValues = JSON.parse(localStorage.getItem('gameValues'));
const defaultValues = [
    { id: 'welcome', value: 0 },
    { id: 'show_stream_chat', value: 1 },
];
if (
    gameValues === null ||
    gameValues.length <= 0 ||
    gameValues.length != defaultValues.length
) {
    localStorage.setItem('gameValues', JSON.stringify(defaultValues));
    gameValues = defaultValues;
}

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
            // arcade: {
            //     debug: true
            // },
            default: 'arcade',
        },
        dom: {
            createContainer: true,
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