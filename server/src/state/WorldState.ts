import { MapSchema, Schema, type } from "@colyseus/schema";

export class Player extends Schema {
	@type("number") x!: number;
	@type("number") y!: number;
	@type("string") direction!: string;
}

export default class WorldState extends Schema {
	@type({ map: Player }) players = new MapSchema<Player>();
}
