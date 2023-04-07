// modules
import log from "./module/Logs.ts";
import Webserver from "./internal/Webserver.ts";

// config
import config from "../config.json" assert { type: "json" };

// init logging
log.initLogs();

// environment settings
if (!process.env.NODE_ENV)
	process.env.NODE_ENV = config.production ? "production" : "development";

// start web server
Webserver.init();
