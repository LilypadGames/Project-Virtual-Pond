import Core from "./internal/Core";
import config from "../config";

interface roomInfo {
	music: string | undefined;
	layers: Array<roomLayer>;
}
interface roomLayer {
	texture: {
		key: string;
		path: string;
	};
	depth: string | number;
}

export default class Game extends Core {
	room: string;
	roomData!: roomInfo;
	walkableLayer: Array<Phaser.GameObjects.Image> = [];
	unwalkableLayer: Array<Phaser.GameObjects.Image> = [];

	constructor(room: string) {
		super("Game");

		// default room
		if (!room) room = "pond";

		// save room
		this.room = room;
	}

	preload() {
		// core
		this.core.preload(this);

		// get room data
		this.roomData = this.registry.get("roomData")[this.room];
	}

	create() {
		// core
		this.core.create();

		// generate room
		this.generateRoom();
	}

	// create the room
	generateRoom() {
		// generate room
		Object.keys(this.roomData.layers).forEach((layerIndex) => {
			// get layer data
			let layerData = this.roomData.layers[layerIndex as any];

			// create layer
			let layer = this.add.image(
				this.sys.canvas.width / 2,
				this.sys.canvas.height / 2,
				layerData.texture.key
			);

			// background layer
			if (layerData.depth === "background") {
				// set depth
				layer.setDepth(config.depth.background);
			}
			// ground layer
			else if (layerData.depth === "ground") {
				// set depth
				layer.setDepth(config.depth.ground);

				// set as a walkable layer
				this.walkableLayer.push(layer);

				//walkable functionality
				// layer.setInteractive().on(
				// 	'pointerdown',
				// 	(pointer: Phaser.Input.Pointer) => {
				// 		if (
				// 			this.navigationCheck(
				// 				pointer.x,
				// 				pointer.y
				// 			)
				// 		) {
				// 			this.onMoveAttempt(
				// 				pointer.x,
				// 				pointer.y
				// 			);
				// 		}
				// 	},
				// 	this
				// );
			}
			// foreground layer
			else if (layerData.depth === "foreground") {
				// set depth
				layer.setDepth(config.depth.foreground);

				// set as an unwalkable layer
				this.unwalkableLayer.push(layer);
			}
			// shader layer
			else if (layerData.depth === "shader") {
				// set depth
				layer.setDepth(config.depth.shader);
			}
			// other layer
			else if (Number.isFinite(layerData.depth)) {
				// set depth
				layer.setDepth(layerData.depth as number);

				// set as an unwalkable layer
				this.unwalkableLayer.push(layer);
			}
		});
	}
}
