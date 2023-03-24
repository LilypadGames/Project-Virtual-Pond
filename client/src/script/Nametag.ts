import config from "../config";
import Utility from "../utility/Utility";

export default class Nametag extends Phaser.GameObjects.Container {
	color?: number;
	text!: Phaser.GameObjects.Text;
	nametagData!: Phaser.GameObjects.TextStyle;
	movement!: Phaser.Tweens.Tween;

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		width: number,
		height: number,
		name: string,
		client: boolean,
		color?: number | undefined
	) {
		super(scene, x, y);

		// save values
		this.name = name;
		this.color = color;

		// create nametag
		this.create(name, width, height, client);

		// show nametag
		this.scene.sys.displayList.add(this);
	}

	create(name: string, width: number, height: number, client: boolean) {
		// client name tag
		if (client) {
			// default nametag config
			this.nametagData =
				config.nametagClientConfig as Phaser.GameObjects.TextStyle;

			//special player name colors
			if (this.color) {
				this.nametagData.color = Utility.hexIntegerToString(this.color);
			}
		}

		// other player name tag
		else {
			// default nametag config
			this.nametagData =
				config.nametagConfig as Phaser.GameObjects.TextStyle;

			//special player name colors
			if (this.color) {
				this.nametagData.color = Utility.hexIntegerToString(this.color);
				this.nametagData.strokeThickness = 6;
			} else {
				this.nametagData.stroke = "";
				this.nametagData.strokeThickness = 0;
			}
		}

		// create name tag
		this.text = this.scene.add
			.text(0, height / 2, name, this.nametagData)
			.setFontSize(config.nametagFontSize)
			.setOrigin(0.5, 1);

		// init container
		this.add(this.text).setSize(width, height).setDepth(config.depth.info);

		// add physics
		this.scene.physics.world.enable(this);
		(this.body as any).setCollideWorldBounds(true);
	}

	delete() {
		// delete layers
		this.removeAll(true);

		// destroy this container
		this.destroy();
	}
}
