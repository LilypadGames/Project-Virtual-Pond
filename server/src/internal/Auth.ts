// imports
import { Express, Request, Response } from "express";
import { VerifyCallback } from "passport-oauth2";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import crypto from "crypto";
import passport, { DoneCallback } from "passport";
import {
	Strategy as TwitchAuthStrategy,
	TwitchProfile,
} from "passport-twitch-latest";

// modules
import log from "../module/Logs.ts";
import database from "../module/Database.ts";

// config
import config from "../../config.json" assert { type: "json" };

export default {
	init: function (app: Express) {
		// add middlewares
		app.use(bodyParser.urlencoded({ extended: true }));
		app.use(cookieParser());
		app.use(
			session({
				secret: crypto.randomBytes(64).toString("hex"),
				resave: false,
				saveUninitialized: true,
				cookie: { secure: true },
			})
		);
		app.use(passport.initialize());

		// set up auth stream
		passport.use(
			new TwitchAuthStrategy(
				{
					clientID: config.twitch.clientID,
					clientSecret: config.twitch.clientSecret,
					callbackURL: config.twitch.callbackURL,
					scope: "user_read",
				},
				async function (
					_accessToken: string,
					_refreshToken: string,
					profile: TwitchProfile,
					done: VerifyCallback
				) {
					// store users name and ID in database
					const path = "users/" + profile.id + "/name";
					const pathExists = await database.pathExists(path);
					if (!pathExists)
						database.setValue(path, profile.display_name);

					log.debug(JSON.stringify(profile));

					// auth'd
					return done(null, profile);
				}
			)
		);
		passport.serializeUser(function (user: any, done: DoneCallback) {
			done(null, user);
		});
		passport.deserializeUser(function (user: any, done: DoneCallback) {
			done(null, user);
		});

		// auth connection
		app.get("/auth/twitch", passport.authenticate("twitch"));
		app.get(
			"/auth/twitch/callback",
			passport.authenticate("twitch", { failureRedirect: "/" }),
			function (_req: Request, res: Response) {
				// Successful authentication, redirect home.
				res.redirect("/");
			}
		);
	},
};
