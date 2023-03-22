import Phaser from "phaser";
// import store from "storejs";

//
// These are overall mechanics that are common to several different scenes, such as a custom cursor or other UI.
//

export default class Core extends Phaser.Scene {
	constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
		super(config);
	}

	core: any = {
		init: () => {},
		preload: () => {
			// reset average fps
			this.game.loop.resetDelta();
		},
		create: () => {
			// disable right-click context menu
			this.input.mouse.disableContextMenu();
		},
		// restart game
		restart: () => {
			location.reload();
		},
	};

	changeScene(scene: string, data?: object) {
		// stop current scene
		this.scene.stop();

		// start next scene
		this.scene.start(scene, data);
	}
}
