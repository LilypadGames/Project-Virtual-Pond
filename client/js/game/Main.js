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

//sizing config
const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;
const MAX_WIDTH = 1280;
const MAX_HEIGHT = 800;
let SCALE_MODE = 'SMOOTH'; // FIT OR SMOOTH

//global variables
var canvas = document.createElement('canvas');
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

//game configuration
var config = {
    gameTitle: 'Project Virtual Pond',
    gameVersion: 'InDev v0.0.1',
    type: Phaser.CANVAS,
    scale: {
        parent: 'game-container',
        fullscreenTarget: 'game-container',
        mode: Phaser.Scale.NONE,
        // autoCenter: Phaser.Scale.CENTER_BOTH,
        resolution: window.devicePixelRatio,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
    },
    backgroundColor: ColorScheme.Blue,
    render: {
        // pixelArt: true,
        antialiasGL: false,
    },
    physics: {
        arcade: {
            debug: true,
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

window.addEventListener('load', () => {
    //init game
    const game = new Phaser.Game(config);

    //resize game
    const resize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        let width = DEFAULT_WIDTH;
        let height = DEFAULT_HEIGHT;
        let maxWidth = MAX_WIDTH;
        let maxHeight = MAX_HEIGHT;
        let scaleMode = SCALE_MODE;

        let scale = Math.min(w / width, h / height);
        let newWidth = Math.min(w / scale, maxWidth);
        let newHeight = Math.min(h / scale, maxHeight);

        let defaultRatio = DEFAULT_WIDTH / DEFAULT_HEIGHT;
        let maxRatioWidth = MAX_WIDTH / DEFAULT_HEIGHT;
        let maxRatioHeight = DEFAULT_WIDTH / MAX_HEIGHT;

        // smooth scaling
        let smooth = 1;
        if (scaleMode === 'SMOOTH') {
            const maxSmoothScale = 1.15;
            const normalize = (value, min, max) => {
                return (value - min) / (max - min);
            };
            if (width / height < w / h) {
                smooth =
                    -normalize(
                        newWidth / newHeight,
                        defaultRatio,
                        maxRatioWidth
                    ) /
                        (1 / (maxSmoothScale - 1)) +
                    maxSmoothScale;
            } else {
                smooth =
                    -normalize(
                        newWidth / newHeight,
                        defaultRatio,
                        maxRatioHeight
                    ) /
                        (1 / (maxSmoothScale - 1)) +
                    maxSmoothScale;
            }
        }

        // resize the game
        game.scale.resize(newWidth * smooth, newHeight * smooth);

        // scale the width and height of the css
        game.canvas.style.width = newWidth * scale + 'px';
        game.canvas.style.height = newHeight * scale + 'px';

        // center the game with css margin
        game.canvas.style.marginTop = `${(h - newHeight * scale) / 2}px`;
        game.canvas.style.marginLeft = `${(w - newWidth * scale) / 2}px`;
    };
    window.addEventListener('resize', (event) => {
        resize();
    });
    resize();
});
