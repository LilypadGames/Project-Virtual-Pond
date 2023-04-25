// imports
import { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import cookieSession from "cookie-session";
import passport, { DoneCallback, Profile } from "passport";
import { Strategy as TwitchAuthStrategy, TwitchProfile } from "passport-twitch-latest";

// modules
import database from "../module/Database";

// config
import config from "../../config.json" assert { type: "json" };

export default {
	init: function (app: Express) {
		// add middlewares
		app.use(bodyParser.urlencoded({ extended: true }));
		app.use(cookieParser());
		app.use(
			cookieSession({ secret: crypto.randomBytes(64).toString("hex") })
		);
		app.use(passport.initialize());

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
					done: DoneCallback
				) {
					// store users name and ID in database
					const path = "users/" + profile.id + "/name";
					const pathExists = await database.pathExists(path);
					if (!pathExists)
						database.setValue(path, profile.displayName);

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
