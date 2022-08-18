// Global UI library

class GlobalUI {
    init(scene) {
        //save current scene for the client class
        currentScene = scene;

        //depth
        scene.depthUI = 100002;
        scene.depthOverlay = 100001;
    }

    preload(scene) {
        //sfx
        scene.load.audio(
            'button_click',
            'assets/audio/sfx/UI/button_click.mp3'
        );

        //debug
        scene.load.image('target', 'assets/debug/target.png');
    }

    create(scene) {
        //register sfxs
        scene.sfxButtonClick = scene.sound.add('button_click', { volume: 0 });
        scene.sfxButtonClick.setVolume(
            utility.getLocalStorage('gameOptions')[
                utility.getLocalStorageArrayIndex('gameOptions', 'sfx')
            ].volume
        );
    }

    showRefreshDialog(scene, refreshReason = 'Please refresh to log back in.') {
        //initialize content
        let content = {
            title: 'Disconnected',
            description: refreshReason,
            button: 'Refresh',
        };

        //fade background
        scene.add.rexCover({ alpha: 0.8 }).setDepth(scene.depthUI);

        //create dialog with refresh button
        const dialog = ui.createDialog(scene, content).on(
            'button.click',
            function () {
                //sfx
                scene.sfxButtonClick.play();

                //reload window
                window.location.reload();

                if (scene.key === 'Game')
                    //set menu as closed
                    scene.menuClosed();
            },
            scene
        );

        //dark background
        scene.rexUI.modalPromise(
            dialog.setDepth(scene.depthUI),

            //config
            {
                cover: false,
                duration: {
                    in: 200,
                    out: 200,
                },
            }
        );

        if (scene.key === 'Game')
            //set menu as opened
            scene.menuOpened();
    }

    showToast(scene, message, option) {
        //get scene name
        let sceneName = scene.scene.key;

        //calculate toast duration
        let duration = 3000;
        let textLength = message.length;
        if (textLength * 100 < 3000) {
            duration = 3000;
        } else {
            if (textLength * 100 < 8000) {
                duration = textLength * 100;
            } else {
                duration = 8000;
            }
        }

        //create options
        let options = {};
        if (option !== undefined) options = option;
        if (options.y === undefined) options.y = 40;
        if (options.background === undefined) options.background = {};
        if (options.background.color === undefined)
            options.background.color = ColorScheme.Red;
        if (options.text === undefined) options.text = message;
        if (options.duration.hold === undefined)
            options.duration.hold = duration;

        //init toast variable
        if (!this.toast) {
            this.toast = {};
        }

        //init toast for this scene
        if (!this.toast[sceneName] || option !== undefined) {
            this.toast[sceneName] = ui.createToast(scene, options);
        }

        //show new message
        else {
            //update toast
            this.toast[sceneName].setDisplayTime(duration).showMessage(message);
        }
    }
}
