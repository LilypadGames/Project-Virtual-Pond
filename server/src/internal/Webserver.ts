// imports
import express, { Request, Response } from "express";
import ViteExpress from "vite-express";

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

export default {
	// init express
	app: express(),

	// start web server
	init: function () {
		// setup paths
		this.app.use(
			"/",
			express.static(
				config.paths[
					process.env.NODE_ENV as "production" | "development"
				].client
			)
		);
		this.app.get("/", function (_: Request, res: Response) {
			res.sendFile("index.html", {
				root: htmlPath,
			});
		});

		// setup server
		ViteExpress.listen(this.app, Number(config.server.port), () =>
			log.message("Server initialized with port " + config.server.port)
		);
	},
};
