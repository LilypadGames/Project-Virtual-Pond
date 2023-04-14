import Core from "./internal/Core";
import config from "../config";
import Player from "../script/Player";
import { Server } from "../index";
import { Player as PlayerState } from "../../../server/src/state/WorldState";

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

export default class World extends Core {
	room: string;
	roomData!: roomInfo;
	walkableLayer: Array<Phaser.GameObjects.Image> = [];
	unwalkableLayer: Array<Phaser.GameObjects.Image> = [];
	clientPlayer!: Player;
	players: {
		[id: string]: Player;
	} = {};

	constructor(data: { room: string }) {
		super("World");

		// default room
		if (data === undefined) data = { room: "pond" };
		if (data.room === undefined) data.room = "pond";

		// save room
		this.room = data.room;
	}

	preload() {
		// core
		this.core.preload(this);

		// get room data
		this.roomData = this.registry.get("roomData")[this.room];
	}

	async create() {
		// core
		this.core.create();

		// register events
		this.registerEvents();

		// connect to room
		await Server.joinRoom(this.room);

		// generate room
		this.generateRoom();

		// end wait screen
		this.endWaitScreen();
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
				layer.setInteractive().on(
					"pointerdown",
					(pointer: Phaser.Input.Pointer) => {
						if (this.navigationCheck(pointer.x, pointer.y)) {
							// send movement to server
							Server.room?.send("player.move", {
								x: pointer.x,
								y: pointer.y,
							});

							//move client player
							this.clientPlayer.move({
								x: pointer.x,
								y: pointer.y,
							});
						}
					},
					this
				);
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

	// register events
	registerEvents() {
		// focus page
		this.game.events.on(Phaser.Core.Events.FOCUS, () => {
			// refresh state
			Server.room?.state.players.forEach(
				(playerState: PlayerState, sessionID: string) => {
					// don't refresh client
					if (sessionID === Server.room?.sessionId) return;

					this.players[sessionID].updatePlayer({
						x: playerState.x,
						y: playerState.y,
						direction: playerState.direction,
					});
				}
			);
		});

		// player joined
		Server.events.on(
			"player.join",
			(playerState: PlayerState, sessionID: string, client: boolean) => {
				// DEBUG
				// console.log(playerState.toJSON(), sessionID, client);

				// create player
				this.players[sessionID] = new Player(
					this,
					playerState.x,
					playerState.y,
					playerState.direction,
					sessionID,
					sessionID,
					{
						tint: 0,
						eyeType: "happy",
					}
				);

				// set as client
				if (client) this.clientPlayer = this.players[sessionID];
			},
			this
		);

		// player left
		Server.events.on(
			"player.leave",
			(_playerState: PlayerState, sessionID: string) => {
				// DEBUG
				// console.log(
				// 	JSON.stringify(playerState.toJSON()) + " " + sessionID
				// );

				// delete player
				this.players[sessionID].delete();
				delete this.players[sessionID];
			},
			this
		);

		// player changed
		Server.events.on(
			"player.change",
			(playerState: PlayerState, sessionID: string, client: boolean) => {
				// DEBUG
				// if (!client)
				// 	console.log(
				// 		JSON.stringify(playerState.toJSON()) + " " + sessionID
				// 	);

				// update other players
				if (!client) {
					const player = this.players[sessionID];
					player.move({ x: playerState.x, y: playerState.y });
				}
			},
			this
		);
	}

	//check if click location is allowed by navigational map (returns true if click location is allowed by navigation map and false otherwise)
	navigationCheck(x: number, y: number, layer?: Phaser.GameObjects.Image) {
		//layer specified: ignore everything else and only check for this layers navigational map
		if (layer) {
			if (this.textures.getPixelAlpha(x, y, layer.texture.key) == 255) {
				return true;
			}
		}

		//prevent walking if clicked on an unwalkable layer (foreground for example)
		else {
			// check unwalkable layers
			for (let i = 0; i < this.unwalkableLayer.length; i++) {
				if (
					this.textures.getPixelAlpha(
						x,
						y,
						this.unwalkableLayer[i].texture.key
					) == 255
				) {
					return false;
				}
			}
		}

		// check if clicked spot is on a walkable layer
		for (let i = 0; i < this.walkableLayer.length; i++) {
			if (
				this.textures.getPixelAlpha(
					x,
					y,
					this.walkableLayer[i].texture.key
				) == 255
			) {
				return true;
			}
		}

		return false;
	}
}
