// Initializes Game

// const gameWidth = (48 * 32);
// const gameHeight = (34 * 32);

const gameWidth = 1280;
const gameHeight = 800;

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
            pixelArt: true
        },
        physics: {
            default: 'arcade'
        },
        dom: {
            createContainer: true
        },
        disableContextMenu: true,
        hidePhaser: true,
        hideBanner: true,
        scene: [ Game ]
    };

    //init game
    game = new Phaser.Game(config);

    //version
    console.log('%c %c Project Virtual Pond - InDev v0.0.1', 'background: #64BEFF;', 'background: #000000;');
};