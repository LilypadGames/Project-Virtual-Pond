import Player from "../../script/Player";
import World from "../World";

export default class Debug extends Phaser.Scene {
	world!: World;
	player!: Player;
	debugText!: Phaser.GameObjects.Text;

	constructor() {
		super({ key: "Debug" });
	}

	init() {
		// save values
		this.world = this.game.scene.getScene("World") as World;

		// get client player
		this.player = this.world.clientPlayer;
	}

	preload() {}

	create() {
		// init debug info text
		this.debugText = this.add.text(0, 0, "").setScrollFactor(0);

		// enable debug lines
		this.world.physics.world.drawDebug = true;
	}

	update() {
		// get actual mouse position
		let pointer = this.world.input.activePointer;

		// update debug
		this.debugText.setText([
			"FPS: " + this.game.loop.actualFps,
			"",
			"Player Pos: (" + this.player.x + ", " + this.player.y + ")",
			"",
			"Mouse Pos: (" + pointer.x + ", " + pointer.y + ")",
		]);
	}
}
