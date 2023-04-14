import { Client, Room } from "colyseus.js";
import Phaser from "phaser";
import WorldState, { Player } from "../../../server/src/state/WorldState";

export class Server {
	private client: Client;
	room?: Room<WorldState>;

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

		// event: ping
		this.room.onMessage("ping", (sentTime: number) => {
			// emit player left event
			this.events.emit("ping", sentTime);
		});

		// event: player joined
		this.room.state.players.onAdd = (player: Player, sessionID: string) => {
			// emit player join event
			this.events.emit(
				"player.join",
				player,
				sessionID,
				this.room?.sessionId === sessionID
			);

			// emit player change event
			player.onChange = () => {
				this.events.emit(
					"player.change",
					player,
					sessionID,
					this.room?.sessionId === sessionID
				);
			};
		};

		// event: player left
		this.room.state.players.onRemove = (
			player: Player,
			sessionID: string
		) => {
			// emit player left event
			this.events.emit("player.leave", player, sessionID);
		};

		return true;
	}

	// leave room on server
	leave() {
		this.room?.leave();
		this.events.removeAllListeners();
	}
}
