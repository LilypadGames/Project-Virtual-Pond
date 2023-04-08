import { Schema } from "@colyseus/schema";

export enum GameState {
	WaitingForPlayers,
	Playing,
	Finished,
}

export interface IWorld extends Schema {
	gameState: GameState;
}

export default IWorld;
