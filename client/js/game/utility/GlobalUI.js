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
}
