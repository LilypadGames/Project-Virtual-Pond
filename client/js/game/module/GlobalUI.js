// Global UI library

class GlobalUI {
    init(scene) {
        //save current scene for the client class
        currentScene = scene;

        //depth
        scene.depthUI = 100002;
        scene.depthOverlay = 100001;
        scene.depthLoadingScreen = 999999;
        scene.depthDialog = 1000000;
        scene.depthDebug = 1000001;

        //debug
        if (debugMode) {
            this.enableDebug(scene);
        } else {
            scene.physics.world.drawDebug = false;
            scene.physics.world.debugGraphic.clear();
        }

        //reset
        delete this.toast;
    }

    preload(scene) {
        //sfx
        scene.load.audio(
            'button_click',
            'assets/audio/sfx/UI/button_click.ogg'
        );

        //UI
        scene.load.spritesheet('loadingIcon', 'assets/ui/loading.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        scene.load.image(
            'rotate_device_to_horizontal',
            'assets/ui/rotate_device_to_horizontal.png'
        );

        //debug
        scene.load.image('target', 'assets/debug/target.png');
    }

    create(scene) {
        //sfx
        scene.sfxButtonClick = scene.sound.add('button_click', { volume: 0 });
        scene.sfxButtonClick.setVolume(store.get('gameOptions.sfx.volume'));

        //debug
        scene.input.keyboard.on(
            'keydown-' + 'SHIFT',
            () => {
                if (scene.scene.key === 'Game') {
                    if (!scene.chatBox.isFocused) {
                        this.toggleDebugMode(scene);
                    }
                } else {
                    this.toggleDebugMode(scene);
                }
            },
            scene
        );
        scene.input.on(
            'pointermove',
            (pointer) => {
                if (debugMode) {
                    this.debugCursor.copyPosition(pointer);
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

    update(scene) {
        //update debug info
        if (debugMode) {
            this.updateDebugInfo(scene);
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

    showDialog(scene, title, description, button, callback) {
        //initialize content
        let content = {
            title: title,
            description: description,
            button: button,
        };

        //fade background
        // scene.add.rexCover({ alpha: 0.8 }).setDepth(scene.depthUI);

        //create dialog with acknowledgement button
        const dialog = ui
            .createDialog(scene, content)
            .on(
                'button.click',
                function () {
                    //sfx
                    scene.sfxButtonClick.play();

                    //close
                    dialog.emit('modal.requestClose');

                    //set menu as closed
                    if (scene.menuClosed)
                        //set menu as closed
                        scene.menuClosed();

                    //callback
                    if (callback) callback();
                },
                scene
            )
            .setDepth(scene.depthUI);

        //dark background
        scene.rexUI.modalPromise(
            dialog,

            //config
            {
                cover: false,
                duration: {
                    in: 200,
                    out: 200,
                },
            }
        );

        if (scene.menuOpened)
            //set menu as opened
            scene.menuOpened();
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
            dialog.setDepth(scene.depthDialog),

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
        if (options.background.stroke === undefined)
            options.background.stroke = {};
        if (options.background.stroke.color === undefined)
            options.background.stroke.color = ColorScheme.DarkRed;
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

    //create outlines on hover
    setOutlineOnHover(scene, sprite) {
        // sprite
        //     .on(
        //         'pointerover',
        //         function () {
        //             // //show outline
        //             // this.rexOutlineFX.add(sprite, {
        //             //     thickness: 3,
        //             //     outlineColor: ColorScheme.White,
        //             // });
        //         },
        //         scene
        //     )
        //     .on(
        //         'pointerout',
        //         function () {
        //             // //remove outline
        //             // this.rexOutlineFX.remove(sprite);
        //         },
        //         scene
        //     );
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
        //prevent double-clicking
        if (
            this.debugToggleTime !== undefined &&
            Date.now() - this.debugToggleTime <= 200
        )
            return;
        this.debugToggleTime = Date.now();

        //off
        if (debugMode) {
            this.disableDebug(scene);
        }

        //on
        else if (!debugMode) {
            this.enableDebug(scene);
        }
    }

    //enable debug mode
    enableDebug(scene) {
        //log
        console.log(utility.timestampString('[DEBUG MODE: ON]'));

        //set debug mode to true
        debugMode = true;

        //enable debug collision boxes
        scene.physics.world.drawDebug = true;

        //add debug cursor
        this.debugCursor = scene.add
            .image(8, 8, 'target')
            .setDepth(scene.depthDebug);
        this.debugCursor.copyPosition(scene.input.mousePointer);

        //add debug ping info
        this.debugPing = scene.add
            .text(0, 0, 'Ping: Waiting...')
            .setDepth(scene.depthDebug);

        //add debug info
        this.debugInfo = scene.add.text(0, 14).setDepth(scene.depthDebug);
        this.updateDebugInfo(scene);
    }

    //disable debug mode
    disableDebug(scene) {
        //log
        console.log(utility.timestampString('[DEBUG MODE: OFF]'));

        //disable debug collision boxes
        scene.physics.world.drawDebug = false;
        scene.physics.world.debugGraphic.clear();

        //set debug mode to false
        debugMode = false;

        //remove debug cursor
        this.debugCursor.destroy();

        //remove debug ping info
        this.debugPing.destroy();

        //remove debug info
        this.debugInfo.destroy();
    }

    //update debug info
    updateDebugInfo(scene) {
        this.debugInfo.setText(
            'x: ' + scene.input.activePointer.x + '\n' +
            'y: ' + scene.input.activePointer.y
        );
    }
}
