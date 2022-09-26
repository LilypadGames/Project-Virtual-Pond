// Create Loading Screen

class LoadingScreen {
    runLoadingScreen(scene, destroyLoadingIcon = false) {
        //set background color
        scene.cameras.main.setBackgroundColor(ColorScheme.Blue);

        //progress bar
        let boxWidth = 600;
        let boxHeight = 80;
        let barWidth = 580;
        let barHeight = 60;
        var progressBox = scene.add.graphics();
        progressBox.fillStyle(ColorScheme.DarkBlue, 1);
        progressBox.fillRoundedRect(
            scene.sys.game.canvas.width / 2 - boxWidth / 2,
            scene.sys.game.canvas.height / 2 - boxHeight / 2,
            boxWidth,
            boxHeight,
            15
        );
        var progressBar = scene.add.graphics();

        //progressing
        scene.load.on('progress', function (value) {
            progressBar.clear();
            progressBar.fillStyle(ColorScheme.LightBlue, 1);
            progressBar.fillRoundedRect(
                scene.sys.game.canvas.width / 2 - barWidth / 2,
                scene.sys.game.canvas.height / 2 - barHeight / 2,
                barWidth * value,
                barHeight,
                15
            );
        });

        //completed
        scene.load.on('complete', function () {
            //remove progress bar
            progressBar.destroy();
            progressBox.destroy();
        });
    }

    runWaitScreen(scene) {
        //create loading icon animation
        scene.anims.create({
            key: 'loadingIconAnim',
            frames: scene.anims.generateFrameNumbers('loadingIcon', { end: 7 }),
            frameRate: 18,
            repeat: -1,
        });

        //create background overlay
        this.loadingBackground = scene.add
            .rectangle(
                scene.sys.game.canvas.width / 2,
                scene.sys.game.canvas.height / 2,
                gameWidth,
                gameHeight,
                ColorScheme.Blue
            )
            .setDepth(scene.depthLoadingScreen);

        //create loading icon
        this.loadingIcon = scene.add
            .sprite(
                scene.sys.game.canvas.width / 2,
                scene.sys.game.canvas.height / 2,
                'loadingIcon'
            )
            .setDepth(scene.depthLoadingScreen);

        //play loading icon animation
        this.loadingIcon.play('loadingIconAnim');
    }

    endWaitScreen() {
        this.loadingBackground.destroy();
        this.loadingIcon.destroy();
    }
}
