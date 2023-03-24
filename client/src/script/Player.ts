import Game from "../scene/Game";
import Utility from "../utility/Utility";
import Nametag from "./Nametag";

interface playerData {
	tint: number;
	eyeType: string;
	accessory?: string;
	nameColor?: number;
	isSponsor?: boolean;
	isVIP?: boolean;
	isAdmin?: boolean;
	isMod?: boolean;
}

export default class Player extends Phaser.GameObjects.Container {
	id: number;
	playerData: playerData;
	tintLayer!: Phaser.GameObjects.Sprite;
	overlayLayer!: Phaser.GameObjects.Sprite;
	eyesLayer!: Phaser.GameObjects.Sprite;
	accessoryLayer!: Phaser.GameObjects.Sprite;
	nametag!: Nametag;
	message!: Phaser.GameObjects.Container;
	movement!: Phaser.Tweens.Tween;

	constructor(
		scene: Game,
		x: number,
		y: number,
		id: number,
		name: string,
		data: playerData
	) {
		super(scene, x, y);

		// save values
		this.id = id;
		this.name = name;
		this.playerData = data;

		// create player
		this.create();

		// show player
		this.scene.sys.displayList.add(this);
	}

	// create player
	create() {
		// get global player data
		const globalPlayerData = this.scene.cache.json.get("playerData");

		// tint-able sprite
		this.tintLayer = this.scene.add
			.sprite(0, 0, globalPlayerData.texture.tint)
			.setOrigin(0.5, 1);

		// overlay sprite
		this.overlayLayer = this.scene.add
			.sprite(0, 0, globalPlayerData.texture.overlay)
			.setOrigin(0.5, 1);

		// eye sprite
		this.eyesLayer = this.scene.add
			.sprite(0, 0, "player_eyes_" + this.playerData.eyeType)
			.setOrigin(0.5, 1);

		// accessory sprite
		if (this.playerData.accessory)
			this.accessoryLayer = this.scene.add
				.sprite(0, 0, "player_accessory_" + this.playerData.accessory)
				.setOrigin(0.5, 1);

		// init container
		this.add([this.tintLayer, this.overlayLayer, this.eyesLayer])
			.setSize(this.tintLayer.width, this.tintLayer.height)
			.setDepth(this.y);

		// add accessory layer
		if (this.accessoryLayer) this.add(this.accessoryLayer);

		// create nametag
		this.nametag = new Nametag(
			this.scene,
			this.x,
			this.y,
			this.tintLayer.width,
			this.tintLayer.height,
			this.name,
			this.id === this.scene.registry.get("clientID"),
			this.playerData.nameColor
		);

		// add physics
		this.scene.physics.world.enable(this);
		(this.body as any).setCollideWorldBounds(true);

		// update player
		this.update({
			x: this.x,
			y: this.y,
			character: {
				color: this.playerData.tint,
			},
		});
	}

	update(data: {
		x?: number;
		y?: number;
		direction?: string;
		character?: {
			color?: number;
			eyeType?: string;
		};
		message?: string;
	}) {
		//place x
		if (data.x) {
			this.x = data.x;
			this.nametag.x = data.x;
			if (this.message) this.message.x = data.x;
		}

		//place y
		if (data.y) {
			this.y = data.y;
			this.nametag.y = data.y;
			if (this.message) this.message.y = data.y;
		}

		//direction
		if (data.direction) this.setDirection(data.direction);

		//character
		if (data.character) {
			//color
			if (data.character.color) {
				//update color
				this.tintLayer.setTexture(
					this.getTintedSprite(
						this.scene.cache.json.get("playerData").texture.tint,
						Utility.hexIntegerToString(data.character.color)
					)
				);
			}

			//eye type
			if (data.character.eyeType) {
				//update eye type
				this.eyesLayer.setTexture(
					"frog_eyes_" + data.character.eyeType
				);
			}
		}

		// //message
		// if (data.message) {
		// 	//show message
		// 	this.message.show(data.message, { playSound: false });
		// } else {
		// 	//remove message
		// 	this.message.remove();
		// }
	}

	move(x: number, y: number) {
		//update player direction
		this.changeDirection(x, y);

		//determine targets to move
		let targets = [this, this.nametag];
		// if (this.message) targets.push(this.message);

		//move player (and store it for alteration later)
		try {
			//stop current movement
			if (this.movement) this.movement.stop();

			//new movement
			this.movement = this.scene.add.tween({
				targets: targets,
				x: x,
				y: y,
				duration:
					Phaser.Math.Distance.Between(this.x, this.y, x, y) * 4,
			});
		} catch (error) {
			console.log(
				"[" +
					this.scene.cache.json.get("lang_en_us")
						.error_player_movement +
					"] " +
					error
			);
		}
	}

	halt(newX: number = this.x, newY: number = this.y) {
		//stop movement
		try {
			if (this.movement) this.movement.stop();
		} catch (error) {
			console.log(
				"[" +
					this.scene.cache.json.get("lang_en_us").error_player_halt +
					"] " +
					error
			);
			return;
		}

		//sync check
		if (newX != this.x || newY != this.y) {
			this.update({ x: newX, y: newY });
		}
	}

	changeMovement(newX: number, newY: number, newDirection: string) {
		//get duration of movement
		var newDuration =
			Phaser.Math.Distance.Between(this.x, this.y, newX, newY) * 5;

		//change x
		this.movement.updateTo("x", newX, true);
		this.nametag.movement.updateTo("x", newX, true);
		// if (this.message)
		// 	(this as any).message.movement.updateTo("x", newX, true);

		//change y
		this.movement.updateTo("y", newY, true);
		this.nametag.movement.updateTo("y", newY, true);
		// if (this.message) this.message.movement.updateTo("y", newY, true);

		//change duration
		this.movement.updateTo("duration", newDuration, true);
		this.nametag.movement.updateTo("duration", newDuration, true);
		// if (this.message)
		// 	this.message.movement.updateTo(
		// 		"duration",
		// 		newDuration,
		// 		true
		// 	);

		//change direction
		if (newDirection) {
			this.setDirection(newDirection);
		}
	}

	changeDirection(newX: number, newY: number) {
		//get players current direction
		var currentDirection = this.getDirection();

		//init newDirection
		var newDirection;

		//get direction as degrees
		var targetRad = Phaser.Math.Angle.Between(this.x, this.y, newX, newY);
		var targetDegrees = Phaser.Math.RadToDeg(targetRad);

		//moving right
		if (targetDegrees > -90 && targetDegrees < 90) {
			newDirection = "right";
		}

		//moving left
		else if (targetDegrees > 90 || targetDegrees < -90) {
			newDirection = "left";
		}

		//look direction changed
		if (
			(newDirection === "right" && currentDirection === "left") ||
			(newDirection === "left" && currentDirection === "right")
		) {
			this.flipDirection();
		}
	}

	setDirection(direction: string) {
		//if specified direction is different from current direction, change the players direction
		if (
			(direction == "left" && this.tintLayer.scaleX > 0) ||
			(direction == "right" && this.tintLayer.scaleX < 0)
		) {
			this.flipDirection();
		}
	}

	flipDirection() {
		this.tintLayer.scaleX *= -1;
		this.overlayLayer.scaleX *= -1;
		this.eyesLayer.scaleX *= -1;
		if (this.accessoryLayer) this.accessoryLayer.scaleX *= -1;
	}

	getDirection() {
		//player character is facing right
		if (this.tintLayer.scaleX > 0) {
			return "right";
		}

		//player character is facing left
		else if (this.tintLayer.scaleX < 0) {
			return "left";
		}

		return undefined;
	}

	// get or create and cache a tinted version of the tint-able sprite
	getTintedSprite(sprite: string, tint: string) {
		//if texture not created yet
		if (!this.scene.textures.exists(sprite + "_" + tint)) {
			//get base tint-able texture
			let baseTexture = this.scene.textures.get(sprite).getSourceImage();

			//init new tinted texture
			var tintedTexture = this.scene.textures.createCanvas(
				sprite + "_" + tint,
				baseTexture.width,
				baseTexture.height
			);

			//get tinted texture data
			var ctx = tintedTexture.context;

			//apply tint
			ctx.fillStyle = tint;
			ctx.fillRect(0, 0, baseTexture.width, baseTexture.height);
			ctx.globalCompositeOperation = "multiply";
			ctx.drawImage(baseTexture as CanvasImageSource, 0, 0);
			ctx.globalCompositeOperation = "destination-atop";
			ctx.drawImage(baseTexture as CanvasImageSource, 0, 0);
		}

		//return tinted sprite
		return sprite + "_" + tint;
	}

	delete() {
		// delete layers
		this.removeAll(true);

		// delete name tag
		this.nametag.delete();

		// // delete message
		// this.message.delete();

		// destroy this container
		this.destroy();
	}
}
