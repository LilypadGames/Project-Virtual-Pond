import { Server as HTTPServer } from "http";

// imports
import { Server as ColyseusServer } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";

// internal
import Rooms from "./RoomData.ts";

function createServer(webserver: HTTPServer) {
	return new ColyseusServer({
		transport: new WebSocketTransport({
			server: webserver,
		}),
	});
}

export let server: ColyseusServer;

export default {
	init: function (webserver: HTTPServer) {
		// init server
		server = createServer(webserver);

		// define rooms
		for (const roomName in Rooms) {
			server.define(
				roomName,
				Rooms[roomName as keyof typeof Rooms].class
			);
		}
	},
};
