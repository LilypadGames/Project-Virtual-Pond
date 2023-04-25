import Phaser from "phaser";
import config from "./config";
import Menu from "./scene/Menu";
import World from "./scene/World";
import Boot from "./scene/internal/Boot";
import Load from "./scene/internal/Load";
import UI from "./scene/overlay/UI";
import Debug from "./scene/overlay/Debug";
import { Server as ServerConnection } from "./service/Server";

//
// These are the scenes that are included in the game itself. The game is initialized here, and the config info is brought in from a separate file: config.ts
//

export default new Phaser.Game(
	Object.assign(config, {
		scene: [Boot, Load, Menu, World, UI, Debug],
	})
);

export let Server = new ServerConnection();
