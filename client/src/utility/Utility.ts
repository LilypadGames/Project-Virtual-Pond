export default {
	// COLORS
	//hex integer to hex string
	hexIntegerToString: function (hex: number) {
		return "#" + hex.toString(16);
	},
	//hex string to hex integer
	hexStringToInteger: function (hex: string) {
		return parseInt(hex.substring(2), 16);
	},
};
