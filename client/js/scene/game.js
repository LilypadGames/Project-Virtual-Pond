// Game Scene

//initialize scene
var Game = new Phaser.Scene('Game');

//initialize scene variables
var playerMap = {};

// LOGIC
//load game assets
Game.preload = function(){
    //tilemaps
    this.load.image("tileset", "assets/room/house_on_the_river/tilesheet.png");
    this.load.tilemapTiledJSON('map', 'assets/room/house_on_the_river/example_map.json');

    //character
    this.load.image('frog_body','assets/character/frog_body.png');
    this.load.image('frog_belly','assets/character/frog_belly.png');
    this.load.image('frog_eyes','assets/character/frog_eyes.png');
};

//set up game
Game.create = function(){

    //set up tilemap/tileset
    const map = this.make.tilemap({ key: 'map' });
    const tileset = map.addTilesetImage('tilesheet', 'tileset', 32, 32); //'tilesheet' is the key of the tileset in map's JSON file
    
    //set up tilemap layers
    var layer;
    for(var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i, tileset);
    };

    //register left click input
    this.input.on('pointerdown', () => Client.sendClick(this.input.mousePointer.worldX, this.input.mousePointer.worldY));

    //register keyboard inputs
    this.input.keyboard.on('keyup', function(event){

        //Enter
        if (event.key == 'Enter') { Client.onKeyPress(event.key); };

    });

    //add player's character to world
    Client.onPlayerJoin();
};

// UTILITY
//get players current direction
Game.getPlayerDirection = function(id) {

    //get player sprite container
    var playerSprites = playerMap[id].list[0];

    //player character is facing right
    if (playerSprites.scaleX > 0) {
        return 'right'
    
    //player character is facing left
    } else if (playerSprites.scaleX < 0) {
        return 'left'
    };
};

// FUNCTIONS
//add player character to game at specific coordinates
Game.addNewPlayer = function(data) {

    //player character
    var playerBody = this.add.sprite(0, 0, 'frog_body').setOrigin(0.5, 1);
    var playerBelly = this.add.sprite(0, 0,'frog_belly').setOrigin(0.5, 1);
    var playerEyes = this.add.sprite(0, 0,'frog_eyes').setOrigin(0.5, 1);

    //player name
    var playerName = this.add.text(0, 0, 'Guest',{
        fontFamily: 'Arial',
        color: '#ffffff'
    }).setFontSize(12).setOrigin(0.5, 1);

    //create player container
    playerMap[data.id] = this.add.container(data.x, data.y).setSize(playerBody.width, playerBody.height);

    //create player sprite container
    playerMap[data.id].add(this.add.container(0, 0).setSize(playerBody.width, playerBody.height));

    //add player sprites to player sprite container
    playerMap[data.id].list[0].add([playerBody, playerBelly, playerEyes]);

    //create player overlay container
    playerMap[data.id].add(this.add.container(0, 15).setSize(playerName.width, playerName.height));

    //add player name to player overlay container
    playerMap[data.id].list[1].add([playerName]);

    // [IMPORTANT] - playerMap is an array of nested Phaser3 containers
    //
    // playerMap[<Player ID>] = Player Container
    //
    // playerMap[<Player ID>].list[0] = Player Sprite Container
    // playerMap[<Player ID>].list[0].list[0] = frog_body Sprite
    // playerMap[<Player ID>].list[0].list[1] = frog_belly Sprite
    // playerMap[<Player ID>].list[0].list[2] = frog_eyes Sprite
    //
    // playerMap[<Player ID>].list[1] = Player Overlay Container
    // playerMap[<Player ID>].list[1].list[0] = playerName Text
    //
    // This was done so that everything in the Player Sprite Container can be altered/transformed without altering stuff 
    // that should remain untouched like the Player Overlay Container's player name. However, they all stay together when
    // the entire Player Container needs to be moved.

    //update the look of the character from the provided server data
    this.updatePlayerLook(data);
};

//move player character to specific coordinates
Game.movePlayer = function(id, x, y) {

    //get player container
    var player = playerMap[id];

    //update player direction
    Client.updatePlayerDirection(this.getPlayerDirection(id), player.x, player.y, x, y);

    //get distance
    var distance = Phaser.Math.Distance.Between(player.x, player.y, x, y);

    //set up duration of movement
    var duration = distance * 5;

    //move player
    this.add.tween({
        targets: player, 
        x: x, 
        y: y, 
        duration: duration
    });
};

//update player characters
Game.updatePlayerLook = function(data) {

    //get player container
    var player = playerMap[data.id];

    //get player sprite container
    var playerSprites = playerMap[data.id].list[0];

    //get player body layer (inside sprite container)
    var playerBody = playerMap[data.id].list[0].list[0];

    //update players color
    playerBody.tint = data.tint;

    //update players look direction
    if (data.direction == 'right' && this.getPlayerDirection(data.id) == 'left') { playerSprites.scaleX *= -1; }
    else if (data.direction == 'left' && this.getPlayerDirection(data.id) == 'right') { playerSprites.scaleX *= -1; };
};

//remove player character from game
Game.removePlayer = function(id) {
    playerMap[id].destroy();
    delete playerMap[id];
};

//config
var config = {
    width: 24*32,
    height: 17*32,
    scene: [ Game ]
};

//set up game
var game = new Phaser.Game(config);

// SOCKET.IO COMMUNICATION
//initialize client
var Client = {};

//connect to socket.io
Client.socket = io.connect();

//tell server that this client just pressed a key
Client.onKeyPress = function(key){
    if (key == 'Enter'){
        
        //generate random hex code color
        var tint = Math.random() * 0xffffff;

        //tell server that the player has changed its color
        Client.socket.emit('changePlayerColor', tint);
    }
};

//tell server that this client just joined
Client.onPlayerJoin = function(){
    Client.socket.emit('playerLoadedWorld');
};

//tell server that the client has clicked at a specific coordinate
Client.sendClick = function(x, y){
    Client.socket.emit('click', {x: x, y: y});
};

//tell server the client's current direction 
Client.updatePlayerDirection = function(currentDirection, currentX, currentY, newX, newY){

    //init newDirection as blank
    var newDirection = '';

    //get direction as degrees
    var targetRad = Phaser.Math.Angle.Between(currentX, currentY,newX, newY);
    var targetDegrees = Phaser.Math.RadToDeg(targetRad);

    //turn right
    if (targetDegrees > -90 && targetDegrees < 90 && currentDirection !== 'right') {
        newDirection = 'right';

    //turn left
    } else if ((targetDegrees > 90 || targetDegrees < -90) && currentDirection !== 'left') {
        newDirection = 'left';
    }

    //if direction changed, tell the server to update all clients
    if (newDirection !== '') { Client.socket.emit('changePlayerDirection', newDirection); };
};

//on player join
Client.socket.on('addNewPlayer',function(data){
    Game.addNewPlayer(data);
});

//update all players
Client.socket.on('getAllPlayers',function(data){

    //populate game world with currently connected players
    for(var i = 0; i < data.length; i++){
        Game.addNewPlayer(data[i]);
    }

    //trigger specified player's look change
    Client.socket.on('updatePlayerLook',function(data){
        console.log('PLAYER ID: ' + data.id + ' - Updating Player Look> Tint: ' + data.tint + ' Direction: ' + data.direction);
        Game.updatePlayerLook(data);
    });

    //trigger specified player's movement
    Client.socket.on('movePlayer',function(data){
        console.log('PLAYER ID: ' + data.id + ' - Moving to> x:' + data.x + ', y:' + data.y);
        Game.movePlayer(data.id, data.x, data.y);
    });

    //trigger removal of specified player
    Client.socket.on('removePlayer',function(id){
        Game.removePlayer(id);
    });

});

// // GAME INIT
// //init game with config
// var game = new Phaser.Game(gameConfig);
// var Game = {};

// // //initial game parameters
// // function init(){
// //     this.stage.disableVisibilityChange = true;
// //     this.tweens.frameBased = true;
// // };

// //load game assets
// Game.preload = function() {
//     //tilemaps
//     this.load.image("tileset", "assets/room/house_on_the_river/tilesheet.png");
//     this.load.tilemapTiledJSON('map', 'assets/room/house_on_the_river/example_map.json');

//     //character
//     this.load.image('frog_body','assets/character/frog_body.png');
//     this.load.image('frog_belly','assets/character/frog_belly.png');
//     this.load.image('frog_eyes','assets/character/frog_eyes.png');
// };

// //set up game
// Game.create() = function() {
//     //set up client-side stored player character array 
//     playerMap = {};

//     //generate tilemap
//     var map = this.make.tilemap({ key: "map", tileWidth: 32, tileHeight: 32});
//     map.addTilesetImage('tilesheet', 'tileset'); // 'tilesheet' is the key of the tileset in map's JSON file

//     //create tilemap layers
//     var layer;
//     for(var i = 0; i < map.layers.length; i++) {
//         layer = map.createLayer(i);
//     }

//     //detect left click
//     this.input.on('pointerdown', () => getCoordinates());

//     //detect enter key
//     keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)

//     //add player's character to world
//     Client.onPlayerJoin();
// };

// //runs continously
// Game.update() = function() {
    
//     //detect inputs
//     if (keyEnter.isDown) { Client.onKeyPress('enter') }

// }

// // UTILITY
// //get coordinates of mouse down click
// Game.getCoordinates(layer, pointer) = function() {
//     Client.sendClick(pointer.worldX, pointer.worldY);
// };

// //get players current direction
// Game.getPlayerDirection(id) = function() {
//     if (playerMap[id].scale.x > 0) {
//         return 'right'
//     } else if (playerMap[id].scale.x < 0) {
//         return 'left'
//     }
// }

// // GAME FUNCTIONS
// //add player character to game at specific coordinates
// Game.addNewPlayer(data) = function() {

//     //add main features for character (this sprite gets tinted whenever the player changed their color)
//     playerMap[data.id] = game.add.sprite(data.x,data.y,'frog_body');
//     playerMap[data.id].smoothed = false;
//     playerMap[data.id].anchor.setTo(0.5);

//     //add other features of character
//     playerMap[data.id].addChild(game.add.sprite(0,0,'frog_belly'));
//     playerMap[data.id].addChild(game.add.sprite(0,0,'frog_eyes'));
//     for (var i = 0; i < playerMap[data.id].children.length; i++) {
//         playerMap[data.id].children[i].smoothed = false;
//         playerMap[data.id].children[i].anchor.setTo(0.5);
//     }

//     //update the look of the character from server data
//     updatePlayerLook(data);
// };

// //move player character to specific coordinates
// Game.movePlayer(id, x, y) = function() {
//     //get sprite
//     var player = playerMap[id];

//     //get distance
//     var distance = Phaser.Math.distance(player.x, player.y, x, y);

//     //update player direction
//     Client.updatePlayerDirection(getPlayerDirection(id), player.x, player.y, x, y);

//     //set up duration of movement
//     var duration = distance*5;

//     //move sprite
//     var tween = game.add.tween(player);
//     tween.to({x:x, y:y}, duration);
//     tween.start();
// };

// //update player characters
// Game.updatePlayerLook(data) = function() {

//     //update players color
//     playerMap[data.id].tint = data.tint;

//     //update players look direction
//     if (data.direction == 'right' && getPlayerDirection(data.id) == 'left'){
//         playerMap[data.id].scale.x *= -1;
//     } else if (data.direction == 'left' && getPlayerDirection(data.id) == 'right'){
//         playerMap[data.id].scale.x *= -1;
//     }
// };

// //remove player character from game
// Game.removePlayer(id) = function() {
//     playerMap[id].destroy();
//     delete playerMap[id];
// };