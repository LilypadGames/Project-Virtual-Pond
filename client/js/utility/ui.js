// UI Functions

class UI {

    //create text with background
    createLabel(scene, text, textSize, align = 'left', backgroundColor = 0x5e92f3) {
        return scene.rexUI.add.label({
            width: 80, // Minimum width of round-rectangle
            height: 80, // Minimum height of round-rectangle

            background: scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, backgroundColor),

            text: scene.add.text(0, 0, text, {
                fontSize: textSize
            }),

            align: align,
    
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        });
    };

    //show dialog box on screen
    showDialog(scene, content) {

        //get content
        const title = content[0];
        const message = content[1];
        const option = content[2];

        //create dialog
        var dialog = scene.rexUI.add.dialog({
            x: scene.canvas.width/2,
            y: scene.canvas.height/2,
            width: 1000,

            background: scene.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),

            title: this.createLabel(scene, title, 48, 'center', 0x1565c0),

            content: this.createLabel(scene, message, 40, 'center', 0x1565c0),

            actions: [
                this.createLabel(scene, option, 40, 'center')
            ],

            space: {
                left: 20,
                right: 20,
                top: -20,
                bottom: -20,

                title: 25,
                titleLeft: 30,
                content: 25,
                description: 25,
                descriptionLeft: 20,
                descriptionRight: 20,
                choices: 25,

                toolbarItem: 5,
                choice: 15,
                action: 15,
            },

            expand: {
                title: false
            },

            align: {
                title: 'center',
                content: 'center',
                actions: 'center'
            },

            click: {
                mode: 'release'
            }
        })
        .layout()
        .popUp(1000)

        //set up interactions with dialog
        .on('button.click', function (button, groupName, index, pointer, event) {
            // scene.print.text += groupName + '-' + index + ': ' + button.text + '\n';
            window.location.reload();
        }, scene)
        .on('button.over', function (button, groupName, index, pointer, event) {
            button.getElement('background').setStrokeStyle(1, 0xffffff);
        })
        .on('button.out', function (button, groupName, index, pointer, event) {
            button.getElement('background').setStrokeStyle();
        });

        //dialog pop-up animation
        scene.tweens.add({
            targets: dialog,
            scaleX: 1,
            scaleY: 1,
            ease: 'Bounce', // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 100,
            repeat: 0, // -1: infinity
            yoyo: false
        });
    };

    //create label for buttons
    createButton(scene, text, textSize, backgroundColor = 0x5e92f3) {
        return scene.rexUI.add.label({
            width: textSize + 10,
            height: textSize + 10,
            background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, backgroundColor),
            text: scene.add.text(0, 0, text, {
                fontSize: textSize
            }),
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        });
    };

    // //show toast
    // showToast(message) {
    //     toast.showMessage(message);
    //     console.log(message);
    // };
};