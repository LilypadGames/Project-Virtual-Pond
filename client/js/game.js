// Handles Game Inputs/Visuals

var Game = {};

// PHASER INIT
//initial game parameters
Game.init = function(){
    game.stage.disableVisibilityChange = true;
    game.tweens.frameBased = true;
};

//load game assets
Game.preload = function() {
    game.load.tilemap('map', '../assets/room/house_on_the_river/example_map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.spritesheet('tileset', '../assets/room/house_on_the_river/tilesheet.png',32,32);
    game.load.image('frog_body','../assets/character/frog_body.png');
    game.load.image('frog_belly','../assets/character/frog_belly.png');
    game.load.image('frog_eyes','../assets/character/frog_eyes.png');
};

//set up game
Game.create = function(){
    Game.playerMap = {};

    //tilemap
    var map = game.add.tilemap('map');
    map.addTilesetImage('tilesheet', 'tileset'); // tilesheet is the key of the tileset in map's JSON file
    var layer;
    for(var i = 0; i < map.layers.length; i++) {
        layer = map.createLayer(i);
    }

    //detect left click
    layer.inputEnabled = true;
    layer.events.onInputUp.add(Game.getCoordinates, this);

    //detect enter key
    var enterKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    enterKey.onDown.add(Client.onKeyPress, 'enter');

    //add player's character to world
    Client.onPlayerJoin();
};

// UTILITY
//get coordinates of mouse down click
Game.getCoordinates = function(layer, pointer){
    Client.sendClick(pointer.worldX, pointer.worldY);
};

//get players current direction
Game.getPlayerDirection = function(id){
    if (Game.playerMap[id].scale.x > 0) {
        return 'right'
    } else if (Game.playerMap[id].scale.x < 0) {
        return 'left'
    }
}

// GAME FUNCTIONS
//add player character to game at specific coordinates
Game.addNewPlayer = function(data){

    //add main features for character (this sprite gets tinted whenever the player changed their color)
    Game.playerMap[data.id] = game.add.sprite(data.x,data.y,'frog_body');
    Game.playerMap[data.id].smoothed = false;
    Game.playerMap[data.id].anchor.setTo(0.5);

    //add other features of character
    Game.playerMap[data.id].addChild(game.add.sprite(0,0,'frog_belly'));
    Game.playerMap[data.id].addChild(game.add.sprite(0,0,'frog_eyes'));
    for (var i = 0; i < Game.playerMap[data.id].children.length; i++) {
        Game.playerMap[data.id].children[i].smoothed = false;
        Game.playerMap[data.id].children[i].anchor.setTo(0.5);
    }

    //update the look of the character from server data
    Game.updatePlayerLook(data);
};

//move player character to specific coordinates
Game.movePlayer = function(id, x, y){

    //get sprite
    var player = Game.playerMap[id];

    //get distance
    var distance = Phaser.Math.distance(player.x, player.y, x, y);

    //update player direction
    Client.updatePlayerDirection(Game.getPlayerDirection(id), player.x, player.y, x, y);

    //set up duration of movement
    var duration = distance*5;

    //move sprite
    var tween = game.add.tween(player);
    tween.to({x:x, y:y}, duration);
    tween.start();
};

//update player characters
Game.updatePlayerLook = function(data){

    //update players color
    Game.playerMap[data.id].tint = data.tint;

    //update players look direction
    if (data.direction == 'right' && Game.getPlayerDirection(data.id) == 'left'){
        Game.playerMap[data.id].scale.x *= -1;
    } else if (data.direction == 'left' && Game.getPlayerDirection(data.id) == 'right'){
        Game.playerMap[data.id].scale.x *= -1;
    }
};

//remove player character from game
Game.removePlayer = function(id){
    Game.playerMap[id].destroy();
    delete Game.playerMap[id];
};