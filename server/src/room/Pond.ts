// imports
import http from "http";
import { Room, Client } from "colyseus";

export default class Pond extends Room {
	// When room is initialized
	onCreate(_options: any) {}

	// Authorize client based on provided options before WebSocket handshake is complete
	onAuth(_client: Client, _options: any, _request: http.IncomingMessage) {}

	// When client successfully join the room
	onJoin(_client: Client, _options: any, _auth: any) {}

	// When a client leaves the room
	onLeave(_client: Client, _consented: boolean) {}

	// Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
	onDispose() {}
}
