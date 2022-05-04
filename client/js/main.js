// Initializes Game

//runs when window loads
window.onload = function() {

    //game configuration
    var config = {
        type: Phaser.AUTO,
        parent: 'game-canvas',
        scene: [ Game ],
        width: 36 * 32,
        height: 25.5 * 32,
        render: {
            pixelArt: true
        },
        physics: {
            default: 'arcade'
        },
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        dom: {
            createContainer: true
        }
    };

    //init game
    game = new Phaser.Game(config);

    //version
    console.log('%c %c Project Virtual Pond - InDev v0.0.1', 'background: #64BEFF;', 'background: #000000;');
}



// //init variables
// var isMobile;
// var game;
// var testObj;

// window.onload = function() {

//     //mobile player
//     isMobile = navigator.userAgent.indexOf("Mobile");
//     if (isMobile == -1) {
//         isMobile = navigator.userAgent.indexOf("Tablet");
//     }
//     if (isMobile == -1) {
//         var config = {
//             type: Phaser.AUTO,
//             width: 480,
//             height: 640,
//             parent: 'game-canvas',
//             scene: [ Game ],
//             render: {
//                 pixelArt: true
//             }
//         };

//     //desktop player
//     } else {
//         var config = {
//             type: Phaser.AUTO,
//             width: window.innerWidth,
//             height: window.innerHeight,
//             parent: 'game-canvas',
//             scene: [ Game ],
//             render: {
//                 pixelArt: true
//             }
//         };
//     }
//     //init game
//     game = new Phaser.Game(config);
// }