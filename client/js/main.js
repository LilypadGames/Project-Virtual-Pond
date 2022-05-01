// Initializes Game

//runs when window loads
window.onload = function() {

    //game configuration
    var config = {
        type: Phaser.AUTO,
        width: 24 * 32,
        height: 17 * 32,
        scale: {
            parent: 'game-canvas',
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        parent: 'game-canvas',
        scene: [ Game ],
        render: {
            pixelArt: true
        }
    };

    //init game
    game = new Phaser.Game(config);
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