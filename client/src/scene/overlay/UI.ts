import Phaser from "phaser";
import InputText from "phaser3-rex-plugins/plugins/inputtext.js";
import ColorScheme from "../../utility/ColorScheme";

export default class UI extends Phaser.Scene {
	chatbox!: InputText;

	constructor() {
		super({ key: "UI" });
	}

	init() {}

	preload() {}

	create() {
		// create chatbox
		this.chatbox = new InputText(this, {
			id: "chat-box",
			x: this.sys.game.canvas.width / 2,
			y: this.sys.game.canvas.height - this.sys.game.canvas.height / 23,
			width: this.sys.game.canvas.width * 0.6,
			height: this.sys.game.canvas.width / 27,
			placeholder: "Say Yo...",
			color: utility.hexIntegerToString(ColorScheme.Black),
			maxLength: this.messageMaxLength,
			depth: this.depthUI,
			onFocus: (inputBox) => {
				if (this.menuOpen) inputBox.setBlur();
			},
			onKeydown: (inputBox, event) => {
				if (event.key == "Enter") {
					//format message
					const chatMessage = inputBox.text
						.substr(0, this.messageMaxLength)
						.trim()
						.replace(/\s+/g, " ");

					//send the message to the server
					if (chatMessage !== "" && chatMessage !== null) {
						client.playerSendingMessage(chatMessage);
					}

					//leave chat bar
					else {
						inputBox.setBlur();
					}

					//clear chat box
					inputBox.setText("");
				}
			},
		});
	}
}
