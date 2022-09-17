// Initializes Game

//imports
const utility = new Utility();

const client = new Client();

const ui = new UI();
const globalUI = new GlobalUI();
const loadingScreen = new LoadingScreen();

const events = new Events();
const ff22 = new FF22();

const twitchEmotes = new Emotes();

//set up config
var roomData = {};
$.getJSON('../config/roomData.json', function (json) {
    roomData.rooms = json;
});

// GLOBAL VARIABLES
//canvas
var canvas = document.createElement('canvas');
//canvas size
const gameWidth = 1280;
const gameHeight = 800;
//global data
var globalData = {};

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
        scene: [Menu, Game, CharacterCreator, FF22DailySpin],
    };

    //init game
    game = new Phaser.Game(config);

    // pure javascript to give focus to the page/frame and scale the game
    window.focus()
    // resize();
    // window.addEventListener("resize", resize, false);
};

// pure javascript to scale the game
// function resize() {
//     var canvas = document.querySelector("canvas");
//     var windowWidth = window.innerWidth;
//     var windowHeight = window.innerHeight;
//     var windowRatio = windowWidth / windowHeight;
//     var gameRatio = game.config.width / game.config.height;
//     if(windowRatio < gameRatio){
//         canvas.style.width = windowWidth + "px";
//         canvas.style.height = (windowWidth / gameRatio) + "px";
//     }
//     else{
//         canvas.style.width = (windowHeight * gameRatio) + "px";
//         canvas.style.height = windowHeight + "px";
//     }
// }