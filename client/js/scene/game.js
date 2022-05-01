// Game Scene

//initialize scene variables
var playerCharacter = {};
var playerData = {};

class Game extends Phaser.Scene {
    // INIT
    constructor() {
        super('Game');
    };

    init() {
        Client = new Client(this);
    };

    // LOGIC
    preload() {

        //init canvas
        this.canvas = this.sys.game.canvas;
        
        //tilemaps
        this.load.image("tileset", "assets/room/house_on_the_river/tilesheet.png");
        this.load.tilemapTiledJSON('map', 'assets/room/house_on_the_river/example_map.json');

        //character
        this.load.image('frog_body','assets/character/frog_body.png');
        this.load.image('frog_belly','assets/character/frog_belly.png');
        this.load.image('frog_eyes','assets/character/frog_eyes.png');
    };

    create() {
    
        //set up tilemap/tileset
        var map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('tilesheet', 'tileset'); //'tilesheet' is the key of the tileset in map's JSON file
        
        //set up tilemap layers
        var layer;
        for(var i = 0; i < map.layers.length; i++) {
            layer = map.createLayer(i, tileset);
        };

        //resize canvas for mobile devices
        // this.resizeApp(layer);

        //register left click input
        this.input.on('pointerdown', () => Client.sendClick(this.input.mousePointer.worldX, this.input.mousePointer.worldY));

        //register keyboard inputs
        this.input.keyboard.on('keyup', function(event){

            //Tell server that this client pressed a key (that actually does something.)
            if (event.key == 'c' || 'Shift') { Client.onKeyPress(event.key); };

            //[DEBUG]
            // console.log(event.key);
        });


        //create UI overlay grid
        this.formUtil = new FormUtil({scene: this, rows: 5, cols: 5});

        //[DEBUG]
        this.formUtil.showNumbers();
        
        // this.formUtil = new FormUtil({
        //     scene: this,
        //     rows: 11,
        //     cols: 11
        // });
        // this.formUtil.showNumbers();
        // //
        // //
        // //
        // this.formUtil.scaleToGameW("myText", .3);
        // this.formUtil.placeElementAt(16, 'myText', true);
        // //
        // //
        // //
        // this.formUtil.scaleToGameW("area51", .8);
        // this.formUtil.scaleToGameH("area51", .5);
        // this.formUtil.placeElementAt(60, "area51", true, true);
        // this.formUtil.addChangeCallback("area51", this.textAreaChanged, this);
        // //
        // //
        // //

        //add player's character to world
        Client.onPlayerJoin();
    };

    // UTILITY
    resizeApp(layer) {
        // Scale canvas
        this.canvas.style.width	= layer.widthInPixels();
        this.canvas.style.height = layer.heightInPixels();

        // // Width-height-ratio of game resolution
        // // Replace 360 with your game width, and replace 640 with your game height
        // let game_ratio = 16 / 9;
        
        // // Make div full height of browser and keep the ratio of game resolution
        // let div = document.getElementById('game-canvas');
        // div.style.width	= (window.innerHeight * game_ratio) + 'px';
        // div.style.height = window.innerHeight + 'px';
        
        // // Check if device DPI messes up the width-height-ratio
        // let canvas = document.getElementsByTagName('canvas')[0];
        
        // let dpi_w = parseInt(div.style.width) / canvas.width;
        // let dpi_h = parseInt(div.style.height) / canvas.height;		
        
        // let height = window.innerHeight * (dpi_w / dpi_h);
        // let width = height * game_ratio;
        
        // // Scale canvas
        // canvas.style.width	= width + 'px';
        // canvas.style.height	= height + 'px';
    }

    textAreaChanged() {
    	var text = this.formUtil.getTextAreaValue("area51");
    	console.log(text);
    };

    //get players current direction
    getPlayerDirection(id) {

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
    addNewPlayer(data) {

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

        //update the look of the character from the provided server data
        this.updatePlayerLook(data);
    };

    //move player character to specific coordinates
    movePlayer(id, x, y) {

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
    updatePlayerLook(data) {

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
    displayMessage(id, message) {

        //get player overlay container
        var playerOverlay = playerCharacter[id].list[1];

        //remove older messages
        if (playerOverlay.list[1]) { playerOverlay.list[1].setVisible(false); }
        if (playerOverlay.list[2]) { playerOverlay.list[2].destroy(); }

        //store message data
        playerData[id] = {
            message: message,
            messageID: this.time.now,
            messageDuration: 5000
        };

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
        var playerMessageBackground = this.add.graphics().fillStyle(0xffffff, 0.80).fillRoundedRect(messageWidth, messageHeight, playerMessage.width, playerMessage.height, 8).lineStyle(1, 0xb8b8b8, 1).strokeRoundedRect(messageWidth, messageHeight, playerMessage.width, playerMessage.height, 8);

        //add message to player overlay container
        playerOverlay.addAt([playerMessageBackground], 1);
        playerOverlay.addAt([playerMessage], 2);

        //make sure message is visible
        playerOverlay.list[1].setVisible(true);

        //schedule message for removal
        this.time.delayedCall(playerData[id].messageDuration, this.removeMessage, [id, this.time.now], this);
    }

    //remove player message
    removeMessage(id, messageID) {

        //check if the message scheduled for removal is the same as the players current message shown
        if (playerData[id].messageID === messageID) {

            //reset chat data
            playerData[id] = {
                message: '',
                messageID: 0,
                messageDuration: 0
            }

            //get player overlay container
            var playerOverlay = playerCharacter[id].list[1];

            //remove message from player character
            playerOverlay.list[1].setVisible(false);
            playerOverlay.list[2].destroy();

        } else {
            return;
        }
    }

    //remove player character from game
    removePlayer(id) {
        playerCharacter[id].destroy();
        delete playerCharacter[id];
    };

}