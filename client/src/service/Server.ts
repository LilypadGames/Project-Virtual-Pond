import { Client, Room } from "colyseus.js";
import Phaser from "phaser";
import WorldState, { Player } from "../../../server/src/state/WorldState";

export class Server {
	private client: Client;
	private room?: Room<WorldState>;

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
			return false;
		}

		// event: player joined
		this.room.state.players.onAdd = (player: Player, sessionID: string) => {
			// emit event
			this.events.emit(
				"playerJoined",
				player,
				sessionID,
				this.room?.sessionId === sessionID
			);
		};

		// event: player left
		this.room.state.players.onRemove = (
			player: Player,
			sessionID: string
		) => {
			// emit event
			this.events.emit("playerLeft", player, sessionID);
		};

		return true;
	}

	// leave room on server
	leave() {
		this.room?.leave();
		this.events.removeAllListeners();
	}
}
