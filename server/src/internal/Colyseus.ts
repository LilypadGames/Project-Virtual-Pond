import { Server as HTTPServer } from "http";
import { Express } from "express";

// imports
import { Server as ColyseusServer } from "@colyseus/core";
import { monitor } from "@colyseus/monitor";
import { WebSocketTransport } from "@colyseus/ws-transport";

// internal
import Rooms from "./RoomData.ts";

export let server: ColyseusServer;
function createServer(webserver: HTTPServer) {
	return new ColyseusServer({
		transport: new WebSocketTransport({
			server: webserver
		}),
	});
}

export default {
	init: function (webserver: HTTPServer, app: Express) {
		// init server
		server = createServer(webserver);

		// define rooms
		for (const roomName in Rooms) {
			server.define(
				roomName,
				Rooms[roomName as keyof typeof Rooms].class
			);
		}

		// start colyseus monitor
		app.use("/colyseus", monitor());
	},
};
