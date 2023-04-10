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
let htmlPath =
	process.env.NODE_ENV === "production"
		? config.paths.production.html
		: config.paths.development.html;

// setup express
export let app = express();
app.use(cors());
app.use(express.json());
export let webserver = createHTTPServer(app);

export default {
	// start web server
	init: function () {
		// setup paths
		app.use(
			"/",
			express.static(
				config.paths[
					process.env.NODE_ENV as "production" | "development"
				].client
			)
		);
		app.get("/", function (_: Request, res: Response) {
			res.sendFile("index.html", {
				root: htmlPath,
			});
		});

		// setup server
		let viteServer = ViteExpress.listen(app, Number(config.server.port), () =>
			log.message("Server initialized with port " + config.server.port)
		);

		// setup Colyseus server
		Colyseus.init(viteServer, app);
	},
};
