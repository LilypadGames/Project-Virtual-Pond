// imports
import { createServer as createHTTPServer } from "http";
import express, { Request, Response } from "express";
import cors from "cors";

// modules
import log from "../module/Logs.ts";

// internal
import Colyseus from "../internal/Colyseus.ts";

// config
import config from "../../config.json" assert { type: "json" };

// get html path
let htmlPath =
	"../" +
	(process.env.NODE_ENV === "production"
		? config.paths.production.html
		: config.paths.development.html);

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
				"../" +
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

		//start web server
		webserver.listen(Number(config.server.port), () => {
			log.info("Web Server Initialized> Port: " + config.server.port);
		});

		// setup Colyseus server
		Colyseus.init(webserver, app);
	},
};
