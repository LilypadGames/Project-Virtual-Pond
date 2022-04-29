// Game Scene

//initialize scene
var Game = new Phaser.Scene('Game');

//initialize scene variables
var playerCharacter = {};
var playerData = {};

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
    var playerSprites = playerCharacter[id].list[0];

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
    var playerName = this.add.text(0, 18, data.name, {
        fontFamily: 'Arial',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
    }).setFontSize(12).setOrigin(0.5, 1);

    //create player container
    playerCharacter[data.id] = this.add.container(data.x, data.y).setSize(playerBody.width, playerBody.height);

    //create player sprite container
    playerCharacter[data.id].add(this.add.container(0, 0).setSize(playerBody.width, playerBody.height));

    //add player sprites to player sprite container
    playerCharacter[data.id].list[0].add([playerBody, playerBelly, playerEyes]);

    //create player overlay container
    playerCharacter[data.id].add(this.add.container(0, 0).setSize(playerBody.width, playerBody.height));

    //add player name to player overlay container
    playerCharacter[data.id].list[1].add([playerName]);

    // [IMPORTANT] - playerCharacter is an array of nested Phaser3 containers
    //
    // playerCharacter[<Player ID>] = Player Container
    //
    // playerCharacter[<Player ID>].list[0] = Player Sprite Container
    // playerCharacter[<Player ID>].list[0].list[0] = frog_body Sprite
    // playerCharacter[<Player ID>].list[0].list[1] = frog_belly Sprite
    // playerCharacter[<Player ID>].list[0].list[2] = frog_eyes Sprite
    //
    // playerCharacter[<Player ID>].list[1] = Player Overlay Container
    // playerCharacter[<Player ID>].list[1].list[0] = playerName Text
    //
    // This was done so that everything in the Player Sprite Container can be altered/transformed without altering stuff 
    // that should remain untouched like the Player Overlay Container's player name. However, they all stay together when
    // the entire Player Container needs to be moved.

    this.displayMessage(data.id, 'Sup frogs. ppL SmokeTime')

    //update the look of the character from the provided server data
    this.updatePlayerLook(data);
};

//move player character to specific coordinates
Game.movePlayer = function(id, x, y) {

    //get player container
    var player = playerCharacter[id];

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
    var player = playerCharacter[data.id];

    //get player sprite container
    var playerSprites = player.list[0];

    //get player body layer (inside sprite container)
    var playerBody = playerSprites.list[0];

    //update players color
    playerBody.tint = data.tint;

    //update players look direction
    if (data.direction == 'right' && this.getPlayerDirection(data.id) == 'left') { playerSprites.scaleX *= -1; }
    else if (data.direction == 'left' && this.getPlayerDirection(data.id) == 'right') { playerSprites.scaleX *= -1; };
};

//display player message
Game.displayMessage = function(id, message) {

    //store message data
    playerData[id] = {
        message: message,
        messageDuration: 5000
    };

    //get player overlay container
    var playerOverlay = playerCharacter[id].list[1];

    //format message
    var playerMessage = this.add.text(0, 0, message, {
        fontFamily: 'Arial',
        color: '#000000',
        lineSpacing: 2,
        align: 'center',
        padding: { left: 8, right: 8, top: 6, bottom: 6 },
        wordWrap: { width: 130 }
    }).setFontSize(12).setOrigin(0.5, 0);

    //calculate size of message
    var messageWidth = (playerMessage.width/2) * -1
    var messageHeight = (playerMessage.height * -1) - 30;

    //reposition text
    playerMessage.setY(messageHeight);

    //create background for message
    var playerMessageBackground = this.add.graphics().fillStyle(0xffffff, 0.80).fillRoundedRect(messageWidth, messageHeight, playerMessage.width, playerMessage.height, 8).lineStyle(1, 0xb8b8b8, 1).strokeRoundedRect(messageWidth, messageHeight, playerMessage.width, playerMessage.height, 8);;

    //remove old messages from player (if any)
    playerOverlay.list[1].setVisible(true)
    //playerOverlay.list[2].destroy();

    //add message to player overlay container
    playerOverlay.addAt([playerMessageBackground], 1);
    playerOverlay.addAt([playerMessage], 2);

    console.log(playerData[id].messageDuration)

    //schedule message for removal
    this.time.delayedCall(playerData[id].messageDuration, this.removeMessage(id, message));

}

//remove player message
Game.removeMessage = function(id, message) {

    //check if the message scheduled for removal is the same as the players current message shown
    if (playerData[id].message === message) {

        console.log('Removing Message')

        //reset chat data
        playerData[id] = {
            message: '',
            messageDuration: 0
        }

        //get player overlay container
        var playerOverlay = playerCharacter[id].list[1];

        // console.log(playerOverlay.list[1]);
        // console.log(playerOverlay.list[2]);

        //remove message from player character
        // playerOverlay.
        playerOverlay.list[1].setVisible(false);
        playerOverlay.list[2].destroy();

    } else {
        return;
    }

}

//remove player character from game
Game.removePlayer = function(id) {
    playerCharacter[id].destroy();
    delete playerCharacter[id];
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