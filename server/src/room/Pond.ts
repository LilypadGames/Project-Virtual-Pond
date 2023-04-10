// imports
// import http from "http";
import { Room, Client } from "colyseus";

// modules
import utility from "../module/Utility.ts";
import log from "../module/Logs.ts";

// internal
import RoomData from "../internal/RoomData.ts";

// data
import WorldState, { Player } from "../state/WorldState.ts";

export default class Pond extends Room<WorldState> {
	// When room is initialized
	onCreate(_options: any) {
		// init state
		this.setState(new WorldState());

		// DEBUG
		log.debug("Creating Room " + this.roomId);
	}

	// // Authorize client based on provided options before WebSocket handshake is complete
	// onAuth(_client: Client, _options: any, _request: http.IncomingMessage) {}

	// When client successfully join the room
	onJoin(client: Client, _options: any, _auth: any) {
		// DEBUG
		log.debug(client.sessionId + " joined!");

		// create player
		const player = new Player();

		// place player in world at random allowed position
		player.x = utility.random.int(
			RoomData.pond.spawnpoint.minX,
			RoomData.pond.spawnpoint.maxX
		);
		player.y = utility.random.int(
			RoomData.pond.spawnpoint.minY,
			RoomData.pond.spawnpoint.maxY
		);

		// add to player list
		this.state.players.set(client.sessionId, player);
	}

	// When a client leaves the room
	onLeave(client: Client, _consented: boolean) {
		log.debug(client.sessionId + " left!");

		// remove from player list
		this.state.players.delete(client.sessionId);
	}

	// Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
	onDispose() {
		// DEBUG
		log.debug("Deleting Room " + this.roomId);
	}
}
