import Core from "./internal/Core";

// modules
import ColorScheme from "../utility/ColorScheme";
import Utility from "../../../server/src/module/Utility";

// UI
import { Label } from "phaser3-rex-plugins/templates/ui/ui-components.js";
import RoundRectangle from "phaser3-rex-plugins/plugins/gameobjects/canvas/roundrectangle/RoundRectangle";
import Button from "phaser3-rex-plugins/plugins/button.js";
import { SetFontSizeToFitWidth } from "phaser3-rex-plugins/templates/ui/ui-components.js";
import Text from "phaser3-rex-plugins/plugins/gameobjects/tagtext/textbase/Text";

// data
import config from "../config";

export default class Menu extends Core {
	startButton!: Button;

	constructor() {
		super({ key: "Menu" });
	}

	preload() {
		// core
		this.core.preload(this);
	}

	create() {
		// core
		this.core.create();

		// create menu
		this.createMenu();

		// end wait screen
		this.endWaitScreen();
	}

	createMenu() {
		// menu background
		this.add.rectangle(
			this.sys.game.canvas.width / 2,
			this.sys.game.canvas.height / 2,
			config.scale.width,
			config.scale.width,
			ColorScheme.DarkerBlue
		);

		// menu art
		this.add.image(
			this.sys.canvas.width / 2,
			this.sys.canvas.height / 2,
			"menu_art"
		);

		// create start button
		this.startButton = new Button(
			new Label(this, {
				x: this.sys.canvas.width / 2,
				y: this.sys.canvas.height - this.sys.canvas.height / 9,
				width: 250,
				height: 100,
				orientation: "x",
				background: new RoundRectangle(
					this,
					0,
					0,
					2,
					2,
					20,
					ColorScheme.DarkerBlue,
					ColorScheme.DarkBlue,
					5
				)
					.setOrigin(0.5, 0.5)
					.addToDisplayList(),
				text: SetFontSizeToFitWidth(
					this.add
						.text(0, 0, "Login", {
							fontFamily: "Burbin",
							color: Utility.hex.toString(ColorScheme.LightGray),
						})
						.setOrigin(0.5, 0.5),
					150
				),
				space: { left: 20, right: 20, top: 20, bottom: 20 },
				align: "center",
			})
				.setScale(0.9, 0.85)
				.setOrigin(0.5, 0.5)
				.layout(),
			{
				mode: "pointerup",
				enable: true,
			}
		)
			.on(
				"over",
				(
					_button: Button,
					gameObject: Label,
					_event: { key: string }
				) => {
					// get background and text
					let background = gameObject.getElement(
						"background"
					) as RoundRectangle;
					let text = gameObject.getElement("text") as Text;

					// change background
					background.setFillStyle(ColorScheme.DarkBlue);
					background.setStrokeStyle(ColorScheme.LightBlue, 5);

					// change text
					text.setColor(Utility.hex.toString(ColorScheme.White));

					// change scale
					gameObject.setScale(1, 1);
				},
				this
			)
			.on(
				"out",
				(
					_button: Button,
					gameObject: Label,
					_event: { key: string }
				) => {
					// get background
					let background = gameObject.getElement(
						"background"
					) as RoundRectangle;
					let text = gameObject.getElement("text") as Text;

					// change background
					background.setFillStyle(ColorScheme.DarkerBlue);
					background.setStrokeStyle(ColorScheme.DarkBlue, 5);

					// change text
					text.setColor(Utility.hex.toString(ColorScheme.LightGray));

					// change scale
					gameObject.setScale(0.9, 0.85);
				},
				this
			)
			.on(
				"click",
				() => {
					this.scene.start("World");
				},
				this
			);
	}
}
