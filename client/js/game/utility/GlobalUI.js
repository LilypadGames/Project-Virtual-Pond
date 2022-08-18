// Global UI library

class GlobalUI {
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

    showToast(scene, message) {
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

        //init toast variable
        if (!this.toast) {
            this.toast = {};
        }

        //init toast for this scene
        if (!this.toast[sceneName]) {
            this.toast[sceneName] = ui.createToast(scene, {
                y: 40,
                background: { color: ColorScheme.Red },
                duration: { hold: duration },
                text: message,
            });

            //show new message
        } else {
            //update toast
            this.toast[sceneName].setDisplayTime(duration).showMessage(message);
        }
    }
}
