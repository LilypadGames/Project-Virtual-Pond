import Phaser from "phaser";
import config from "../../config";
import ColorScheme from "../../utility/ColorScheme";
// import store from "storejs";

//
// These are overall mechanics that are common to several different scenes, such as a custom cursor or other UI.
//

export default class Core extends Phaser.Scene {
	loadingBackground!: Phaser.GameObjects.Rectangle;
	loadingIcon!: Phaser.GameObjects.Sprite;

	constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
		super(config);
	}

	core: any = {
		init: () => {},
		preload: (scene: Phaser.Scene) => {
			// reset average fps
			this.game.loop.resetDelta();

			// wait screen
			this.runWaitScreen(scene);
		},
		create: () => {
			// disable right-click context menu
			this.input.mouse.disableContextMenu();

			// wait screen
			this.endWaitScreen();
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

	runWaitScreen(scene: Phaser.Scene) {
		// create loading icon animation
		scene.anims.create({
			key: "loading_icon",
			frames: scene.anims.generateFrameNumbers("loading_icon", {
				end: 7,
			}),
			frameRate: 18,
			repeat: -1,
		});

		// create background overlay
		this.loadingBackground = scene.add
			.rectangle(
				scene.sys.game.canvas.width / 2,
				scene.sys.game.canvas.height / 2,
				config.scale.width,
				config.scale.width,
				ColorScheme.Blue
			)
			.setDepth(config.depth.loadingScreen);

		// create loading icon
		this.loadingIcon = scene.add
			.sprite(
				scene.sys.game.canvas.width / 2,
				scene.sys.game.canvas.height / 2,
				"loading_icon"
			)
			.setDepth(config.depth.loadingScreen);

		// play loading icon animation
		this.loadingIcon.play("loading_icon");
	}

	endWaitScreen() {
		this.loadingBackground.destroy();
		this.loadingIcon.destroy();
	}
}
