// Global UI library

class GlobalUI {
    init(scene) {
        //save current scene for the client class
        currentScene = scene;

        //depth
        scene.depthUI = 100002;
        scene.depthOverlay = 100001;
        scene.depthDebug = 1000000;
    }

    preload(scene) {
        //sfx
        scene.load.audio(
            'button_click',
            'assets/audio/sfx/UI/button_click.mp3'
        );

        //UI
        scene.load.image(
            'rotate_device_to_horizontal',
            'assets/ui/rotate_device_to_horizontal.png'
        );

        //debug
        scene.load.image('target', 'assets/debug/target.png');
    }

    create(scene) {
        //sfxs
        scene.sfxButtonClick = scene.sound.add('button_click', { volume: 0 });
        scene.sfxButtonClick.setVolume(
            utility.getLocalStorage('gameOptions')[
                utility.getLocalStorageArrayIndex('gameOptions', 'sfx')
            ].volume
        );

        //debug
        this.debugCursor = scene.add
            .image(8, 8, 'target')
            .setDepth(scene.depthDebug);
        scene.input.on(
            'pointermove',
            function (pointer) {
                if (debugMode) {
                    this.debugCursor.copyPosition(pointer);
                }
            },
            this
        );
        this.debugPing = scene.add
            .text(0, 0, 'Ping: Waiting...')
            .setDepth(scene.depthDebug);
        if (!debugMode) {
            this.debugCursor.setVisible(false);
            this.debugPing.setVisible(false);
        }
        scene.input.keyboard.on(
            'keydown-' + 'SHIFT',
            () => {
                if (scene.scene.key === 'Game') {
                    if (!scene.chatBox.isFocused) {
                        this.toggleDebugMode();
                    }
                } else {
                    this.toggleDebugMode();
                }
            },
            scene
        );

        //desktop
        if (scene.sys.game.device.os.desktop) {
            //fullscreen button
            ui.createButtons(scene, {
                x: 30,
                y: 30,
                fontSize: 22,
                space: {
                    item: 15,
                },
                buttons: [
                    //fullscreen
                    {
                        text: '⛶',
                        background: { radius: 8 },
                        width: 50,
                        onClick: () => {
                            if (scene.scale.isFullscreen) {
                                scene.scale.stopFullscreen();
                            } else {
                                scene.scale.startFullscreen();
                            }
                        },
                    },
                ],
            })
                .setDepth(scene.depthUI)
                .setOrigin(0.5, 0);
        }
        //mobile
        else {
            //detect when window orientation is changed
            let orientationChanged = () => {
                //horizontal
                if (window.innerWidth > window.innerHeight) {
                    //remove rotate icon
                    if (scene.cover) scene.cover.destroy();
                    if (scene.rotateIcon) scene.rotateIcon.destroy();

                    //hide header/footer
                    $('header, footer').addClass('hide');

                    //re-instate DOM elements if scene is game
                    if (scene.scene.key == 'Game') {
                        scene.addRoomDOMElements();
                    }
                }

                //vertical
                else {
                    //show rotate icon
                    this.showRotateDialog(scene);

                    //show header/footer
                    $('header, footer').removeClass('hide');

                    //remove DOM elements if scene is game
                    if (scene.scene.key == 'Game') {
                        scene.removeRoomDOMElements();
                    }
                }
            };
            window.onresize = orientationChanged;

            //init orientation
            orientationChanged();
        }
    }

    showRotateDialog(scene) {
        //fade background
        scene.cover = scene.add
            .rexCover({ alpha: 0.8 })
            .setDepth(scene.depthUI);

        //show rotate icon
        scene.rotateIcon = scene.add
            .image(
                scene.sys.game.canvas.width / 2,
                scene.sys.game.canvas.height / 2,
                'rotate_device_to_horizontal'
            )
            .setDepth(scene.depthUI);
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
        if (options.duration === undefined) options.duration = {};
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

    //update ping text
    newPing(latency) {
        if (debugMode) {
            this.debugPing.text = 'Ping: ' + latency + 'ms';
            console.log(utility.timestampString('Ping: ' + latency + 'ms'));
        }
    }

    //toggle console logging
    toggleDebugMode(scene) {
        //off
        if (debugMode) {
            console.log(utility.timestampString('[DEBUG MODE: OFF]'));
            debugMode = false;

            this.debugCursor.setVisible(false);
            this.debugPing.setVisible(false);
        }

        //on
        else if (!debugMode) {
            console.log(utility.timestampString('[DEBUG MODE: ON]'));
            debugMode = true;

            this.debugCursor.setVisible(true);
            this.debugPing.setVisible(true);
        }
    }
}
