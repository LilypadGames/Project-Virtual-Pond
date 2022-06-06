// Create Loading Screen

class LoadingScreen {

    run(scene, destroyLoadingIcon = false) {

        //set background color
        scene.cameras.main.setBackgroundColor(ColorScheme.Blue);

        // //load loading icon
        // scene.load.spritesheet('loadingIcon', 'assets/ui/loading.png', { frameWidth: 64, frameHeight: 64 });
        // scene.anims.create({
        //     key: 'loading',
        //     frames: scene.anims.generateFrameNumbers('loading', { end: 7 }),
        //     frameRate: 16,
        //     repeat: -1
        // });

        // //add loading icon
        // let loadingIcon = this.add.sprite(scene.canvas.width/2, scene.canvas.height/2, 'loadingIcon');
        // loadingIcon.play('loading');

        //progress bar
        let boxWidth = 600;
		let boxHeight = 80;
        let barWidth = 580;
		let barHeight = 60;
        var progressBox = scene.add.graphics();
        progressBox.fillStyle(ColorScheme.DarkBlue, 1);
        progressBox.fillRoundedRect(scene.canvas.width/2 - boxWidth/2, scene.canvas.height/2 - boxHeight/2, boxWidth, boxHeight, 15);
        var progressBar = scene.add.graphics();

        //progressing
        scene.load.on('progress', function (value) {
            progressBar.clear();
            progressBar.fillStyle(ColorScheme.LightBlue, 1);
            progressBar.fillRoundedRect(scene.canvas.width/2 - barWidth/2, scene.canvas.height/2 - barHeight/2, barWidth * value, barHeight, 15);
        });

        //completed
        scene.load.on('complete', function () {

            //remove progress bar
            progressBar.destroy();

            // //remove loading icon
            // if (destroyLoadingIcon) loadingIcon.destroy();

            //reset background color
            // scene.cameras.main.setBackgroundColor();
        });
    };
};