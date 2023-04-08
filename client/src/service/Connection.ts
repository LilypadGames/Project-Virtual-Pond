import { Client, Room } from "colyseus.js";
import Phaser from "phaser";
import IWorld, { GameState } from "../../../server/src/typing/IWorld";
import { Message } from "../../../server/src/typing/Message";

export default class Server {
	private client: Client;
	private events: Phaser.Events.EventEmitter;

	private room?: Room<IWorld>;
	private _playerIndex = -1;

	// get player
	get playerIndex() {
		return this._playerIndex;
	}

	// get game state
	get gameState() {
		if (!this.room) {
			return GameState.WaitingForPlayers;
		}

		return this.room?.state.gameState;
	}

	constructor() {
		// connect
		this.client = new Client("ws://localhost:5500");
		this.events = new Phaser.Events.EventEmitter();
	}

	async join() {
		// connect to room
		this.room = await this.client.joinOrCreate<IWorld>("tic-tac-toe");

		this.room.onMessage(
			Message.PlayerIndex,
			(message: { playerIndex: number }) => {
				// debug
				console.log(message.playerIndex);

				this._playerIndex = message.playerIndex;
			}
		);

		this.room.onStateChange.once((state) => {
			this.events.emit("once-state-changed", state);
		});

		this.room.state.onChange = (changes) => {
			changes.forEach((change) => {
				// format change
				const { field, value } = change;

				// debug
				console.log(change);

				// detect change
				switch (field) {
					case "gameState":
						this.events.emit("game-state-changed", value);
						break;
				}
			});
		};
	}

	// disconnect
	leave() {
		this.room?.leave();
		this.events.removeAllListeners();
	}

	onceStateChanged(cb: (state: IWorld) => void, context?: any) {
		this.events.once("once-state-changed", cb, context);
	}

	onGameStateChanged(cb: (state: GameState) => void, context?: any) {
		this.events.on("game-state-changed", cb, context);
	}
}
