import { Client, Room } from "colyseus.js";
import Phaser from "phaser";
import { Player } from "../../../server/src/state/WorldState";

export default class Server {
	private client: Client;
	private room?: Room;

	events: Phaser.Events.EventEmitter;

	constructor() {
		// connect to server
		this.client = new Client("ws://localhost:5500");

		// set up events
		this.events = new Phaser.Events.EventEmitter();
	}

	// join room on server
	async joinRoom(room: string) {
		try {
			// connect to room
			this.room = await this.client.joinOrCreate(room);
		} catch (e) {
			// DEBUG
			console.error(e);
			return;
		}

		// event: player joined
		this.room.state.players.onAdd((player: Player, sessionId: string) => {
			//DEBUG
			console.log("Player Joined: ", sessionId);

			// emit event
			this.events.emit("playerJoined", player);
		});

		// event: player left
		this.room.state.players.onRemove(
			(player: Player, sessionId: string) => {
				//DEBUG
				console.log("Player Left: ", sessionId);

				// emit event
				this.events.emit("playerLeft", player);
			}
		);
	}

	// leave room on server
	leave() {
		this.room?.leave();
		this.events.removeAllListeners();
	}
}
