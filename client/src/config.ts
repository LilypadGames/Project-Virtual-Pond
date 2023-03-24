import Phaser from "phaser";
import ColorScheme from "./utility/ColorScheme";
import Utility from "./utility/Utility";

// constants
const gameWidth = 1280;
const gameHeight = 800;

//
// These are the settings for the game canvas and game itself.
//

export default {
	gameTitle: "Project Virtual Pond",
	gameVersion: "InDev v0.0.1",
	type: Phaser.CANVAS,
	scale: {
		parent: "game-container",
		fullscreenTarget: "game-container",
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		resolution: window.devicePixelRatio,
		max: {
			width: gameWidth,
			height: gameHeight,
		},
		width: gameWidth,
		height: gameHeight,
	},
	backgroundColor: ColorScheme.Blue,
	render: {
		// pixelArt: true,
		antialiasGL: false,
	},
	physics: {
		arcade: {
			debug: true,
		},
		default: "arcade",
	},
	dom: {
		createContainer: true,
	},
	audio: {
		disableWebAudio: true,
		noAudio: false,
	},
	plugins: {},
	disableContextMenu: true,
	hidePhaser: true,
	hideBanner: true,
	depth: {
		background: 0 - 2,
		ground: 0 - 1,
		foreground: gameHeight + 1,
		shader: gameHeight + 2,
		info: gameHeight + 3,
		loadingScreen: gameHeight + 4,
	},
	nametagClientConfig: {
		fontFamily: "Burbin",
		color: Utility.hexIntegerToString(ColorScheme.White),
		stroke: Utility.hexIntegerToString(ColorScheme.Black),
		strokeThickness: 6,
	},
	nametagConfig: {
		fontFamily: "Burbin",
		color: Utility.hexIntegerToString(ColorScheme.Black),
	},
	nametagFontSize: 14,
};
