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
						key: "textureData",
						url: "/data/texture.json",
					},
					{
						type: "json",
						key: "playerData",
						url: "/data/player.json",
					},
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
		// load textures
		const textureData = this.cache.json.get("textureData");
		Object.keys(textureData).forEach((key) => {
			this.load.image(key, textureData[key]);
		});

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
