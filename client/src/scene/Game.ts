import Core from "./internal/Core";

export default class Game extends Core {
	constructor() {
		super("Game");
	}

	preload() {
		this.core.preload(this);
	}

	create() {
		this.core.create();
	}
}
