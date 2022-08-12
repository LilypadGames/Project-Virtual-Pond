// Initializes Game

//imports
const ui = new UI();
const globalUI = new GlobalUI();
const utility = new Utility();
const client = new Client();
const loadingScreen = new LoadingScreen();
const twitchEmotes = new Emotes();

//set up config
var globalConfig = {};
$.getJSON("../config/rooms.json", function(json) {
	globalConfig.rooms = json;
});

// GLOBAL VARIABLES
//canvas
var canvas = document.createElement('canvas');
const gameWidth = 1280;
const gameHeight = 800;

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

//scene
var currentScene;

//debug
var debugMode = false;
const depthDebug = 1000000;

//player
var clientID;

//runs when window loads
window.onload = function () {
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
                    key: 'rexOutlineFX',
                    plugin: rexoutlinepipelineplugin,
                    start: true,
                    mapping: 'rexOutlineFX',
                },
                {
                    key: 'rexInputText',
                    plugin: rexinputtextplugin,
                    start: true,
                    mapping: 'rexInputText',
                },
            ],
        },
        disableContextMenu: true,
        hidePhaser: true,
        hideBanner: true,
        scene: [Menu, Game, CharacterCreator],
    };

    //init game
    game = new Phaser.Game(config);
};
