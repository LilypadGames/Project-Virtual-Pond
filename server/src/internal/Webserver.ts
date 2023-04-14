// imports
import { createServer as createHTTPServer } from "http";
import express, { Request, Response } from "express";
import cors from "cors";
import ViteExpress from "vite-express";

// internal
import Colyseus from "../internal/Colyseus.ts";

// modules
import log from "../module/Logs.ts";

// config
import config from "../../config.json" assert { type: "json" };

// set up vite-express config
ViteExpress.config({
	mode: process.env.NODE_ENV as "production" | "development",
});

// get html path
const htmlPath =
	process.env.NODE_ENV === "production"
		? config.paths.production.html
		: config.paths.development.html;

// setup express
export const app = express();
app.use(cors());
app.use(express.json());
export const webserver = createHTTPServer(app);

export default {
	// start web server
	init: function () {
		// setup paths
		app.get("/", function (_: Request, res: Response) {
			res.sendFile("index.html", {
				root: htmlPath,
			});
		});

		// setup server
		webserver.listen(Number(config.server.port), () =>
			log.info("Web Server Initialized> Port: " + config.server.port)
		);

		// setup Colyseus server
		Colyseus.init(webserver, app);

		// bind vite express
		ViteExpress.bind(app, webserver);
	},
};
