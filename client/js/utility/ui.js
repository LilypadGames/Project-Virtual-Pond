// UI Functions

class UI {

    //get variables
    get colorWhite() {
        return this.constructor.colorWhite;
    };
    get colorLightBlue() {
        return this.constructor.colorLightBlue;
    };
    get colorBlue() {
        return this.constructor.colorBlue;
    };
    get colorDarkBlue() {
        return this.constructor.colorDarkBlue;
    };

    //create text with background
    createText(scene, content) {

        //defaults
        if (!content.textX) { content.textX = 0; };
        if (!content.textY) { content.textY = 0; };
        if (!content.textSize) { content.textSize = 12; };

        if (!content.align) { content.align = 'left'; };

        if (!content.space) { content.space = {} };
        if (!content.space.left) { content.space.left = 5; };
        if (!content.space.right) { content.space.right = 5; };
        if (!content.space.top) { content.space.top = 5; };
        if (!content.space.bottom) { content.space.bottom = 5; };

        return scene.rexUI.add.label({

            text: scene.add.text(content.textX, content.textY, content.text, { fontSize: content.textSize }),

            align: content.align,
    
            space: {
                left: content.space.left,
                right: content.space.right,
                top: content.space.top,
                bottom: content.space.bottom
            }
        });
    };

    //create text with background
    createLabel(scene, content) {

        //defaults
        if (!content.width) { content.width = 40; };
        if (!content.height) { content.width = 40; };

        if (!content.backgroundX) { content.backgroundX = 0; };
        if (!content.backgroundY) { content.backgroundY = 0; };
        if (!content.backgroundWidth) { content.backgroundWidth = 100; };
        if (!content.backgroundHeight) { content.backgroundHeight = 40; };
        if (!content.backgroundRadius) { content.backgroundRadius = 20; };
        if (!content.backgroundColor) { content.backgroundColor = this.colorBlue; };
        if (!content.backgroundTransparency) { content.backgroundTransparency = 1; };

        if (!content.textX) { content.textX = 0; };
        if (!content.textY) { content.textY = 0; };
        if (!content.textSize) { content.textSize = 12; };

        if (!content.align) { content.align = 'left'; };

        if (!content.space) { content.space = {} };
        if (!content.space.left) { content.space.left = 10; };
        if (!content.space.right) { content.space.right = 10; };
        if (!content.space.top) { content.space.top = 10; };
        if (!content.space.bottom) { content.space.bottom = 10; };

        return scene.rexUI.add.label({
            width: content.width,
            height: content.height,

            background: scene.rexUI.add.roundRectangle(content.backgroundX, content.backgroundY, content.backgroundWidth, content.backgroundHeight, content.backgroundRadius, content.backgroundColor, content.backgroundTransparency),

            text: scene.add.text(content.textX, content.textY, content.text, { fontSize: content.textSize }),

            align: content.align,
    
            space: {
                left: content.space.left,
                right: content.space.right,
                top: content.space.top,
                bottom: content.space.bottom
            }
        });
    };

    //show dialog box on screen
    createDialog(scene, content) {

        //defaults
        if (!content.x) { content.x = scene.canvas.width/2; };
        if (!content.y) { content.y = scene.canvas.height/2; };
        if (!content.width) { content.width = 700; };

        if (!content.backgroundX) { content.backgroundX = 0; };
        if (!content.backgroundY) { content.backgroundY = 0; };
        if (!content.backgroundWidth) { content.backgroundWidth = 100; };
        if (!content.backgroundHeight) { content.backgroundHeight = 100; };
        if (!content.backgroundRadius) { content.backgroundRadius = 20; };
        if (!content.backgroundColor) { content.backgroundColor = this.colorDarkBlue; };
        if (!content.backgroundTransparency) { content.backgroundTransparency = 1; };

        if (!content.titleTextSize) { content.titleTextSize = 48; };
        if (!content.titleAlign) { content.titleAlign = 'center'; };
        if (!content.titleBackgroundColor) { content.titleBackgroundColor = this.colorDarkBlue; };

        if (!content.contentTextSize) { content.contentTextSize = 48; };
        if (!content.contentAlign) { content.contentAlign = 'center'; };

        if (!content.buttonTextSize) { content.buttonTextSize = 40; };
        if (!content.buttonColor) { content.buttonColor = this.colorBlue; };
        if (!content.buttonColorOnHover) { content.buttonColorOnHover = this.colorLightBlue; };
        if (!content.buttonSpace) { content.buttonSpace = {} };
        if (!content.buttonSpace.left) { content.buttonSpace.left = 10; };
        if (!content.buttonSpace.right) { content.buttonSpace.right = 10; };
        if (!content.buttonSpace.top) { content.buttonSpace.top = 8; };
        if (!content.buttonSpace.bottom) { content.buttonSpace.bottom = 8; };

        if (!content.space) { content.space = {} };
        if (!content.space.left) { content.space.left = 20; };
        if (!content.space.right) { content.space.right = 20; };
        if (!content.space.top) { content.space.top = -20; };
        if (!content.space.bottom) { content.space.bottom = -20; };

        if (!content.align) { content.align = {} };
        if (!content.align.title) { content.align.title = 'center'; };
        if (!content.align.content) { content.align.content = 'center'; };
        if (!content.align.actions) { content.align.actions = 'center'; };

        if (!content.animation) { content.animation = {} };
        if (!content.animation.ease) { content.animation.ease = 'Bounce'; };
        if (!content.animation.duration) { content.animation.duration = 100; };

        //create elements
        const background = scene.rexUI.add.roundRectangle(content.backgroundX, content.backgroundY, content.backgroundWidth, content.backgroundHeight, content.backgroundRadius, content.backgroundColor, content.backgroundTransparency);
        const title = this.createLabel(scene, { text: content.titleText, textSize: content.titleTextSize, align: content.titleAlign, backgroundColor: content.titleBackgroundColor });
        const description = this.createText(scene, { text: content.contentText, textSize: content.contentTextSize, align: content.contentAlign });
        var actions = [];
        for (let i = 0; i < content.actions.length; i++) {
            //get action content
            const actionContent = content.actions[i];

            //defaults
            if (!actionContent.align) { actionContent.align = 'center' };

            //add to actions
            actions.push(
                this.createLabel(scene, { text: actionContent.text, textSize: content.buttonTextSize, align: actionContent.align, backgroundColor: content.buttonColor, space: {left: content.buttonSpace.left, right: content.buttonSpace.right, top: content.buttonSpace.top, bottom: content.buttonSpace.bottom} })
            );
        };

        //create dialog
        var dialog = scene.rexUI.add.dialog({
            x: content.x,
            y: content.y,
            width: content.width,

            background: background,

            title: title,

            content: description,

            actions: actions,

            space: {
                left: content.space.left,
                right: content.space.right,
                top: content.space.top,
                bottom: content.space.bottom,

                title: 25,
                titleLeft: 30,
                content: 25,

                action: 15,
            },

            expand: {
                title: false
            },

            align: {
                title: content.align.title,
                content: content.align.content,
                actions: content.align.actions
            },

            click: {
                mode: 'release'
            }
        })
        .layout()
        .popUp(1000)

        //interaction
        .on('button.click', function (button, groupName, index, pointer, event) {
            scene.interactDialog(button.text);
        }, scene)

        //animation
        .on('button.over', function (button, groupName, index, pointer, event) {
            button.getElement('background').setFillStyle(content.buttonColorOnHover);
        })
        .on('button.out', function (button, groupName, index, pointer, event) {
            button.getElement('background').setFillStyle(content.buttonColor);
        });
        scene.tweens.add({
            targets: dialog,
            scaleX: 1,
            scaleY: 1,
            ease: content.animation.ease, // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: content.animation.duration,
            repeat: 0, // -1: infinity
            yoyo: false
        });

    };

    

    // //create buttons
    // createButton(scene, text, textSize, backgroundColor = this.colorLightBlue) {
    //     return scene.rexUI.add.label({
    //         width: textSize + 10,
    //         height: textSize + 10,
    //         background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, backgroundColor),
    //         text: scene.add.text(0, 0, text, {
    //             fontSize: textSize
    //         }),
    //         space: {
    //             left: 10,
    //             right: 10,
    //             top: 10,
    //             bottom: 10
    //         }
    //     });
    // };

    //show options menu
    showOptions(scene) {
        this.showDialog
    };

    //show toast
    showToast(message) {
        toast.showMessage(message);
        console.log(message);
    };
};

//colors
UI.colorWhite = 0xffffff;
UI.colorLightBlue = 0x5e92f3;
UI.colorBlue = 0x1883ED;
UI.colorDarkBlue = 0x1563BB;