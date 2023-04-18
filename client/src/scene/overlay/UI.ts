// imports
import Phaser from "phaser";

// modules
import ColorScheme from "../../utility/ColorScheme";
import Utility from "../../../../server/src/module/Utility";

// rexrainbow phaser plugin
import InputText from "phaser3-rex-plugins/plugins/inputtext.js";

// data
import config from "../../config";
import RoundRectangle from "phaser3-rex-plugins/plugins/gameobjects/canvas/roundrectangle/RoundRectangle";

export default class UI extends Phaser.Scene {
	chatbox!: {
		inputField: InputText;
		background: RoundRectangle;
	};
	messageMaxLength = 80;
	menuOpen: boolean = false;

	constructor() {
		super({ key: "UI" });
	}

	init() {}

	preload() {}

	create() {
		// create chatbox
		this.createChatBox();
	}

	createChatBox() {
		this.chatbox = {
			// chat box text input field
			inputField: new InputText(this, {
				x: this.sys.game.canvas.width / 2,
				y:
					this.sys.game.canvas.height -
					this.sys.game.canvas.height / 23,
				width: this.sys.game.canvas.width * 0.6,
				height: 30,
				placeholder: "Say Yo...",
				color: Utility.hex.toString(ColorScheme.Black),
				maxLength: this.messageMaxLength,
				fontSize: "24",
				spellCheck: false,
				autoComplete: "off",
				borderColor: Utility.hex.toString(ColorScheme.Black),
				type: "text",
				fontFamily: "Burbin",
			})

				// depth
				.setDepth(config.depth.ui)

				// focus event
				.on(
					"focus",
					(inputBox: InputText) => {
						// prevent usage when a menu is open
						if (this.menuOpen) inputBox.setBlur();
					},
					this
				)

				// send event
				.on(
					"keydown",
					(inputBox: InputText, event: { key: string }) => {
						if (event.key == "Enter") {
							//format message
							const chatMessage = inputBox.text
								.substring(0, this.messageMaxLength)
								.trim()
								.replace(/\s+/g, " ");

							//send the message to the server
							if (chatMessage !== "" && chatMessage !== null) {
								// client.playerSendingMessage(chatMessage);
							}

							//leave chat bar
							else {
								inputBox.setBlur();
							}

							//clear chat box
							inputBox.setText("");
						}
					},
					this
				)

				// show
				.addToDisplayList(),

			// chat box background
			background: new RoundRectangle(
				this,
				this.sys.game.canvas.width / 2 - 2.5,
				this.sys.game.canvas.height - this.sys.game.canvas.height / 23,
				this.sys.game.canvas.width * 0.6 + 10,
				30,
				15,
				ColorScheme.White,
				ColorScheme.LightGray,
				2
			)

				// depth
				.setDepth(config.depth.ui)

				// show
				.addToDisplayList(),
		};
	}
}
