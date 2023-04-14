import Player from "../../script/Player";
import World from "../World";
import { Server } from "../../index.ts";

export default class Debug extends Phaser.Scene {
	world!: World;
	player!: Player;
	debugText!: Phaser.GameObjects.Text;
	latency: number | string = "Calculating...";

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

		// latency calc
		Server.events.on("ping", (sentTime: number) => {
			// calc
			this.latency = String(Date.now() - sentTime) + "ms";
		});
	}

	update() {
		// get actual mouse position
		let pointer = this.world.input.activePointer;

		// update debug
		this.debugText.setText([
			"FPS: " + this.game.loop.actualFps,
			"",
			"Latency: " + this.latency,
			"",
			"Player Pos: (" + this.player.x + ", " + this.player.y + ")",
			"",
			"Mouse Pos: (" + pointer.x + ", " + pointer.y + ")",
		]);
	}
}
