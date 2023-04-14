export default {
	player: {
		navigation: function (_newPos: { x: number; y: number }) {
			// // check unwalkable layers
			// for (let i = 0; i < this.unwalkableLayer.length; i++) {
			//     if (
			//         this.textures.getPixelAlpha(
			//             x,
			//             y,
			//             this.unwalkableLayer[i].texture.key
			//         ) == 255
			//     ) {
			//         return false;
			//     }
			// }

			// // check if clicked spot is on a walkable layer
			// for (let i = 0; i < this.walkableLayer.length; i++) {
			// 	if (
			// 		this.textures.getPixelAlpha(
			// 			x,
			// 			y,
			// 			this.walkableLayer[i].texture.key
			// 		) == 255
			// 	) {
			// 		return true;
			// 	}
			// }

			// return false;

			return true;
		},

		direction: function (
			currentPos: { x: number; y: number },
			newPos: { x: number; y: number }
		) {
			// get direction of movement in degrees
			const targetDegrees =
				(Math.atan2(newPos.y - currentPos.y, newPos.x - currentPos.x) *
					180) /
				Math.PI;

			// calc new direction
			return targetDegrees > -90 && targetDegrees < 90 ? "right" : "left";
		},
	},
};
