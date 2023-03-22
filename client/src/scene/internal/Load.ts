import Phaser from "phaser";
import WebFont from "webfontloader";

//
// This is meant for loading in any data, such as a save game state, prior to entering the main menu.
//

export default class Load extends Phaser.Scene {
	constructor() {
		super({
			key: "Load",
			pack: {
				files: [
					{
						type: "json",
						key: "itemData",
						url: "/data/item.json",
					},
				],
			},
		});
	}

	preload() {
		// load font
		WebFont.load({
			custom: {
				families: ["Burbin"],
				urls: ["/site/css/styles.css"],
			},
		});
	}

	create() {
		// Menu
		this.scene.start("hello-world");
	}
}
