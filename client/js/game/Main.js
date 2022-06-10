// Initializes Game

//imports
const ui = new UI();
const utility = new Utility();
const client = new Client();
const loadingScreen = new LoadingScreen();

// GLOBAL VARIABLES
//canvas
const gameWidth = 1280;
const gameHeight = 800;

//settings (cookies)
var gameOptions = JSON.parse(localStorage.getItem('gameOptions'));
const defaultOptions = [
    { id: 'music', volume: 0.5 },
    { id: 'sfx', volume: 1 }
];
if (gameOptions === null || gameOptions.length <= 0 || gameOptions.length != defaultOptions.length) {
    localStorage.setItem('gameOptions', JSON.stringify(defaultOptions));
    gameOptions = defaultOptions;
};

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
        backgroundColor: ColorScheme.Blue,
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
        plugins: {
            scene: [
                {
                    key: 'rexUI',
                    plugin: rexuiplugin,
                    mapping: 'rexUI'
                }
            ],
            global: [
                {
                    key: 'rexCover',
                    plugin: rexcoverplugin,
                    start: true,
                    mapping: 'rexCover'
                },
                {
                    key: 'rexOutlineFX',
                    plugin: rexoutlinepipelineplugin,
                    start: true,
                    mapping: 'rexOutlineFX'
                },
                {
                    key: 'rexInputText',
                    plugin: rexinputtextplugin,
                    start: true,
                    mapping: 'rexInputText'
                }
            ]
        },
        disableContextMenu: true,
        hidePhaser: true,
        hideBanner: true,
        scene: [ Menu, Game, CharacterCreator ]
    };

    //init game
    game = new Phaser.Game(config);

    //version
    console.log('%c %c Project Virtual Pond - InDev v0.0.1', 'background: #64BEFF;', 'background: #000000;');
};