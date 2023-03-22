import Phaser from "phaser";
import config from "./config";
import Boot from "./scene/internal/Boot";
import Load from "./scene/internal/Load";

//
// These are the scenes that are included in the game itself. The game is initialized here, and the config info is brought in from a separate file: config.ts
//

export default new Phaser.Game(
	Object.assign(config, {
		scene: [Boot, Load],
	})
);
