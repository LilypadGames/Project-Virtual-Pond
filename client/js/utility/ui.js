// UI Functions

class UI {

    //get variables
    get colorWhite() {
        return this.constructor.colorWhite;
    };
    get colorBlack() {
        return this.constructor.colorBlack;
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

    //create slider
    createSlider(scene, content) {

        //defaults
        if (!content.x) { content.x = 0; };
        if (!content.y) { content.y = 0; };
        if (!content.width) { content.width = 300; };
        if (!content.height) { content.height = 30; };
        if (!content.orientation) { content.orientation = 'x'; };

        if (!content.value) { content.value = 1; };

        if (!content.trackX) { content.trackX = 0; };
        if (!content.trackY) { content.trackY = 0; };
        if (!content.trackWidth) { content.trackWidth = 0; };
        if (!content.trackHeight) { content.trackHeight = 0; };
        if (!content.trackRadius) { content.trackRadius = 10; };
        if (!content.trackColor) { content.trackColor = this.colorBlue; };
        if (!content.trackTransparency) { content.trackTransparency = 1; };

        if (!content.indicatorX) { content.indicatorX = 0; };
        if (!content.indicatorY) { content.indicatorY = 0; };
        if (!content.indicatorWidth) { content.indicatorWidth = 0; };
        if (!content.indicatorHeight) { content.indicatorHeight = 0; };
        if (!content.indicatorRadius) { content.indicatorRadius = 10; };
        if (!content.indicatorColor) { content.indicatorColor = this.colorLightBlue; };
        if (!content.indicatorTransparency) { content.indicatorTransparency = 1; };

        if (!content.thumbX) { content.thumbX = 0; };
        if (!content.thumbY) { content.thumbY = 0; };
        if (!content.thumbWidth) { content.thumbWidth = 0; };
        if (!content.thumbHeight) { content.thumbHeight = 0; };
        if (!content.thumbRadius) { content.thumbRadius = 12; };
        if (!content.thumbColor) { content.thumbColor = this.colorWhite; };
        if (!content.thumbTransparency) { content.thumbTransparency = 1; };

        if (!content.space) { content.space = {} };
        if (!content.space.left) { content.space.left = 0; };
        if (!content.space.right) { content.space.right = 0; };
        if (!content.space.top) { content.space.top = 5; };
        if (!content.space.bottom) { content.space.bottom = 5; };

        if (!content.input) { content.input = 'click'; };

        return scene.rexUI.add.slider({
            x: content.x,
            y: content.y,
            width: content.width,
            height: content.height,
            orientation: content.orientation,

            value: content.value,

            track: scene.rexUI.add.roundRectangle(content.trackX, content.trackY, content.trackWidth, content.trackHeight, content.trackRadius, content.trackColor, content.trackTransparency),
            indicator: scene.rexUI.add.roundRectangle(content.indicatorX, content.indicatorY, content.indicatorWidth, content.indicatorHeight, content.indicatorRadius, content.indicatorColor, content.indicatorTransparency),
            thumb: scene.rexUI.add.roundRectangle(content.thumbX, content.thumbY, content.thumbWidth, content.thumbHeight, content.thumbRadius, content.thumbColor, content.thumbTransparency),

            valuechangeCallback: function (value) {
                scene.onSliderChange(value, content.id);
            },

            space: {
                left: content.space.left,
                right: content.space.right,
                top: content.space.top,
                bottom: content.space.bottom
            },

            input: content.input, // 'drag'|'click'
        })
        .layout();
    };

    //create dialog box
    createDialog(scene, content) {

        //defaults
        if (!content.x) { content.x = scene.canvas.width/2; };
        if (!content.y) { content.y = scene.canvas.height/2; };
        if (!content.width) { content.width = 700; };
        if (!content.height) { content.width = 400; };

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

        if (!content.captionTextSize) { content.captionTextSize = 28; };
        if (!content.captionAlign) { content.captionAlign = 'center'; };

        if (!content.descriptionType) { content.descriptionType = 'text'; };
        if (!content.descriptionTextSize) { content.descriptionTextSize = 28; };
        if (!content.descriptionAlign) { content.descriptionAlign = 'center'; };
        if (!content.descriptionColor) { content.descriptionColor = this.colorBlue; };
        if (!content.descriptionSpace) { content.descriptionSpace = {} };
        if (!content.descriptionSpace.left) { content.descriptionSpace.left = 10; };
        if (!content.descriptionSpace.right) { content.descriptionSpace.right = 10; };
        if (!content.descriptionSpace.top) { content.descriptionSpace.top = 8; };
        if (!content.descriptionSpace.bottom) { content.descriptionSpace.bottom = 8; };

        if (!content.buttonTextSize) { content.buttonTextSize = 28; };
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
        if (!content.space.title) { content.space.title = 25; };
        if (!content.space.titleLeft) { content.space.titleLeft = 0; };
        if (!content.space.content) { content.space.content = 0; };
        if (!content.space.description) { content.space.description = 0; };
        if (!content.space.descriptionLeft) { content.space.descriptionLeft = 25; };
        if (!content.space.descriptionRight) { content.space.descriptionRight = 25; };
        if (!content.space.choices) { content.space.choices = 0; };
        if (!content.space.choice) { content.space.choice = 0; };
        if (!content.space.toolbarItem) { content.space.toolbarItem = 0; };
        if (!content.space.action) { content.space.action = 0; };

        if (!content.expand) { content.expand = {} };
        if (!content.expand.title) { content.expand.title = false; };
        if (!content.expand.content) { content.expand.content = false; };
        if (!content.expand.description) { content.expand.description = false; };
        if (!content.expand.choices) { content.expand.choices = false; };
        if (!content.expand.actions) { content.expand.actions = false; };

        if (!content.align) { content.align = {} };
        if (!content.align.title) { content.align.title = 'center'; };
        if (!content.align.content) { content.align.content = 'center'; };
        if (!content.align.description) { content.align.description = 'center'; };
        if (!content.align.choices) { content.align.choices = 'center'; };
        if (!content.align.actions) { content.align.actions = 'center'; };

        if (!content.draggable) { content.draggable = false; };

        if (!content.animation) { content.animation = {} };
        if (!content.animation.ease) { content.animation.ease = 'Bounce'; };
        if (!content.animation.duration) { content.animation.duration = 100; };

        //create elements
        const background = scene.rexUI.add.roundRectangle(content.backgroundX, content.backgroundY, content.backgroundWidth, content.backgroundHeight, content.backgroundRadius, content.backgroundColor, content.backgroundTransparency);

        const title = this.createLabel(scene, { text: content.titleText, textSize: content.titleTextSize, align: content.titleAlign, backgroundColor: content.titleBackgroundColor });

        if (content.toolbar) {
            var toolbar = [];
            for (let i = 0; i < content.toolbar.length; i++) {
                //get action content
                const toolbarContent = content.toolbar[i];
    
                //defaults
                if (!toolbarContent.align) { toolbarContent.align = 'center' };
    
                //add to toolbar
                toolbar.push(
                    this.createLabel(scene, { text: toolbarContent.text, textSize: content.buttonTextSize, align: toolbarContent.align, backgroundColor: content.buttonColor, space: {left: content.buttonSpace.left, right: content.buttonSpace.right, top: content.buttonSpace.top, bottom: content.buttonSpace.bottom} })
                );
            };
        };

        const caption = this.createText(scene, { text: content.captionText, textSize: content.captionTextSize, align: content.captionAlign });

        var description;
        if (content.descriptionType == 'text') {
            description = this.createText(scene, { text: content.descriptionText, textSize: content.descriptionTextSize, align: content.descriptionAlign, space: {left: content.descriptionSpace.left, right: content.descriptionSpace.right, top: content.descriptionSpace.top, bottom: content.descriptionSpace.bottom} });
        } else if (content.descriptionType == 'label') {
            description = this.createLabel(scene, { text: content.descriptionText, textSize: content.descriptionTextSize, align: content.descriptionAlign, backgroundColor: content.descriptionColor, space: {left: content.descriptionSpace.left, right: content.descriptionSpace.right, top: content.descriptionSpace.top, bottom: content.descriptionSpace.bottom} });
        } else if (content.descriptionType == 'slider') {
            description = this.createSlider(scene, { id: content.sliderID , value: content.sliderValue});
        };

        if (content.choices) {
            var choices = [];
            for (let i = 0; i < content.choices.length; i++) {
                //get action content
                const choiceContent = content.choices[i];
    
                //defaults
                if (!choiceContent.align) { choiceContent.align = 'center' };
    
                //add to actions
                choices.push(
                    this.createLabel(scene, { text: choiceContent.text, textSize: content.buttonTextSize, align: choiceContent.align, backgroundColor: content.buttonColor, space: {left: content.buttonSpace.left, right: content.buttonSpace.right, top: content.buttonSpace.top, bottom: content.buttonSpace.bottom} })
                );
            };
        };

        if (content.actions) {
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
        };
        
        //create dialog
        var dialog = scene.rexUI.add.dialog({
            x: content.x,
            y: content.y,

            width: content.width,
            height: content.height,

            background: background,

            title: title,

            toolbar: toolbar,

            content: caption,

            description: description,

            choices: choices,

            actions: actions,

            space: {
                left: content.space.left,
                right: content.space.right,
                top: content.space.top,
                bottom: content.space.bottom,

                title: content.space.title,
                titleLeft: content.space.titleLeft,
                description: content.space.description,
                descriptionLeft: content.space.descriptionLeft,
                descriptionRight: content.space.descriptionRight,
                choices: content.space.choices,

                toolbarItem: content.space.toolbarItem,
                choice: content.space.choice,
                action: content.space.action,
            },

            expand: {
                title: content.expand.title,
                content: content.expand.content,
                description: content.expand.description,
                choices: content.expand.choices,
                actions: content.expand.actions
            },

            align: {
                title: content.align.title,
                content: content.align.content,
                description: content.align.description,
                choices: content.align.choices,
                actions: content.align.actions
            },

            // draggable: content.draggable,

            click: {
                mode: 'release'
            }
        })
        .layout()
        .popUp(1000)

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

        //draggable
        if (content.draggable = true) {
            dialog.setDraggable('background');
        };

        return dialog;
    };

    //create input box
    createInputBox(scene, content) {

        //defaults
        if (!content.x) { content.x = 0; };
        if (!content.y) { content.y = 0; };
        if (!content.width) { content.width = 500; };
        if (!content.height) { content.height = 40; };
        if (!content.type) { content.type = 'text'; };
        if (!content.text) { content.text = ''; };
        if (!content.placeholder) { content.placeholder = ''; };
        if (!content.fontSize) { content.fontSize = 24; };
        if (!content.color) { content.color = this.colorBlack; };
        if (!content.backgroundColor) { content.backgroundColor = this.colorWhite; };
        if (!content.backgroundRadius) { content.backgroundRadius = 0; };
        if (!content.backgroundSpace) { content.backgroundSpace = {}; };
        if (!content.backgroundSpace.left) { content.backgroundSpace.left = 5; };
        if (!content.backgroundSpace.right) { content.backgroundSpace.right = 5; };
        if (!content.backgroundSpace.top) { content.backgroundSpace.top = 0; };
        if (!content.backgroundSpace.bottom) { content.backgroundSpace.bottom = 0; };
        if (!content.border) { content.border = 0; };
        if (!content.borderColor) { content.borderColor = this.colorBlack; };
        if (!content.spellCheck) { content.spellCheck = false; };
        if (!content.autoComplete) { content.autoComplete = false; };
        if (!content.maxLength) { content.maxLength = 1000; };

        //create input box
        var inputBox = scene.add.rexInputText(
            content.x,
            content.y,
            content.width,
            content.height,
            {
                id: content.id,
                type: content.type,
                text: content.text,
                placeholder: content.placeholder,
                fontSize: content.fontSize,
                color: content.color,
                spellCheck: content.spellCheck,
                autoComplete: content.autoComplete,
                maxLength: content.maxLength
            }
        );

        //create background
        const background = scene.rexUI.add.roundRectangle(content.x - (content.backgroundSpace.left/2), content.y + (content.backgroundSpace.bottom/2), content.width + (content.backgroundSpace.left + content.backgroundSpace.right), content.height + (content.backgroundSpace.top + content.backgroundSpace.bottom), content.backgroundRadius, content.backgroundColor, 1);

        return inputBox;
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
UI.colorBlack = 0x000000;
UI.colorLightBlue = 0x5e92f3;
UI.colorBlue = 0x1883ED;
UI.colorDarkBlue = 0x1563BB;