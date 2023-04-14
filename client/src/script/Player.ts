import Game from "../scene/World";
import Utility from "../utility/Utility";
import Nametag from "./Nametag";
import WorldLogic from "./WorldLogic";

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
	id: string;
	playerData: playerData;
	direction: string;
	tintLayer!: Phaser.GameObjects.Sprite;
	overlayLayer!: Phaser.GameObjects.Sprite;
	eyesLayer!: Phaser.GameObjects.Sprite;
	accessoryLayer!: Phaser.GameObjects.Sprite;
	nametag!: Nametag;
	message!: Phaser.GameObjects.Container;
	movement: Phaser.Tweens.Tween | undefined;

	constructor(
		scene: Game,
		x: number,
		y: number,
		direction: string,
		id: string,
		name: string,
		data: playerData
	) {
		super(scene, x, y);

		// save values
		this.id = id;
		this.name = name;
		this.playerData = data;
		this.direction = direction;

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
		this.updatePlayer({
			x: this.x,
			y: this.y,
			direction: this.direction,
			character: {
				color: this.playerData.tint,
			},
		});
	}

	// update specified player data
	updatePlayer(data?: {
		x?: number;
		y?: number;
		direction?: string;
		character?: {
			color?: number;
			eyeType?: string;
		};
		message?: string;
	}) {
		// update with current values
		if (data == null) {
			data = {};
			data.x = this.x;
			data.y = this.y;
			data.direction = this.direction;
			data.character = this.playerData;
		}

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
		if (data.direction) this.updateDirection(data.direction);

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

	// move to position
	move(newPos: { x: number; y: number }) {
		// no change
		if (this.x === newPos.x && this.y === newPos.y) return;

		//update player direction based on movement
		this.updateDirection(
			WorldLogic.player.direction(
				{ x: this.x, y: this.y },
				{ x: newPos.x, y: newPos.y }
			)
		);

		// // is currently moving
		// if (this.movement && !this.movement.isFinished()) {
		// 	//get duration of movement
		// 	var newDuration =
		// 		Phaser.Math.Distance.Between(
		// 			this.x,
		// 			this.y,
		// 			newPos.x,
		// 			newPos.y
		// 		) * 4;

		// 	//change x
		// 	this.movement.updateTo("x", newPos.x, true);
		// 	this.nametag.movement.updateTo("x", newPos.y, true);
		// 	// if (this.message)
		// 	// 	(this as any).message.movement.updateTo("x", newX, true);

		// 	//change y
		// 	this.movement.updateTo("y", newPos.y, true);
		// 	this.nametag.movement.updateTo("y", newPos.y, true);
		// 	// if (this.message) this.message.movement.updateTo("y", newY, true);

		// 	//change duration
		// 	this.movement.updateTo("duration", newDuration, true);
		// 	this.nametag.movement.updateTo("duration", newDuration, true);
		// 	// if (this.message)
		// 	// 	this.message.movement.updateTo(
		// 	// 		"duration",
		// 	// 		newDuration,
		// 	// 		true
		// 	// 	);
		// }

		// // stationary
		// else {
		// 	//determine targets to move
		// 	let targets = [this, this.nametag];
		// 	// if (this.message) targets.push(this.message);

		// 	//move player (and store it for alteration later)
		// 	try {
		// 		//new movement
		// 		this.movement = this.scene.add.tween({
		// 			targets: targets,
		// 			x: newPos.x,
		// 			y: newPos.y,
		// 			duration:
		// 				Phaser.Math.Distance.Between(
		// 					this.x,
		// 					this.y,
		// 					newPos.x,
		// 					newPos.y
		// 				) * 4,
		// 			callbacks: () => {
		// 				// delete saved tween when done tweening
		// 				delete this.movement;
		// 			},
		// 			onUpdate: () => {
		// 				// update depth
		// 				this.depth = this.y;
		// 			},
		// 		});
		// 	} catch (error) {
		// 		console.log(
		// 			"[" +
		// 				this.scene.cache.json.get("lang_en_us").error
		// 					.player_movement +
		// 				"] " +
		// 				error
		// 		);
		// 	}
		// }

		//determine targets to move
		let targets = [this, this.nametag];
		// if (this.message) targets.push(this.message);

		// stop old movement
		if (this.movement) this.movement.stop();

		//move player (and store it for alteration later)
		try {
			//new movement
			this.movement = this.scene.add.tween({
				targets: targets,
				x: newPos.x,
				y: newPos.y,
				duration:
					Phaser.Math.Distance.Between(
						this.x,
						this.y,
						newPos.x,
						newPos.y
					) * 4,
				callbacks: () => {
					// delete saved tween when done tweening
					delete this.movement;
				},
				onUpdate: () => {
					// update depth
					this.depth = this.y;
				},
			});
		} catch (error) {
			console.log(
				"[" +
					this.scene.cache.json.get("lang_en_us").error
						.player_movement +
					"] " +
					error
			);
		}
	}

	// stop player at specified position or current position
	halt(newPos: { x: number; y: number } = { x: this.x, y: this.y }) {
		//stop movement
		try {
			if (this.movement) this.movement.stop();
		} catch (error) {
			console.log(
				"[" +
					this.scene.cache.json.get("lang_en_us").error.player_halt +
					"] " +
					error
			);
			return;
		}

		//sync check
		if (newPos.x != this.x || newPos.y != this.y) {
			this.updatePlayer({ x: newPos.x, y: newPos.y });
		}
	}

	// update direction
	updateDirection(direction: string) {
		// current real direction
		let realDirection = this.getRealDirection();

		//if specified direction is different from current real direction, change the players direction
		if (
			(direction === "right" && realDirection === "left") ||
			(direction === "left" && realDirection === "right")
		) {
			this.flipDirection();
		}

		// store direction
		this.direction = direction;
	}

	// get sprite direction
	getRealDirection() {
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

	// flip sprite
	flipDirection() {
		this.tintLayer.scaleX *= -1;
		this.overlayLayer.scaleX *= -1;
		this.eyesLayer.scaleX *= -1;
		if (this.accessoryLayer) this.accessoryLayer.scaleX *= -1;
	}

	// get or create and cache a tinted version of the tint-able sprite
	getTintedSprite(sprite: string, tint: string) {
		//if texture not created yet
		if (!this.scene.textures.exists(sprite + "_" + tint)) {
			//get base tint-able texture
			let baseTexture = this.scene.textures.get(sprite).getSourceImage();

			//init new tinted texture
			var tintedTexture: Phaser.Textures.CanvasTexture =
				this.scene.textures.createCanvas(
					sprite + "_" + tint,
					baseTexture.width,
					baseTexture.height
				) as Phaser.Textures.CanvasTexture;

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
