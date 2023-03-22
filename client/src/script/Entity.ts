export default class Entity extends Phaser.GameObjects.Sprite {
	constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
        // pass values to sprite class
		super(scene, x, y, texture);
	}
}
