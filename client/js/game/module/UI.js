// UI Functions

class UI {
    //create text with background
    createText(scene, content) {
        //defaults
        if (!content.x) content.x = 0;
        if (!content.y) content.y = 0;
        if (!content.fontSize) content.fontSize = 12;

        if (!content.align) content.align = 'left';

        if (!content.fontFamily) content.fontFamily = 'Burbin';

        if (!content.space) content.space = {};
        if (!content.space.left) content.space.left = 5;
        if (!content.space.right) content.space.right = 5;
        if (!content.space.top) content.space.top = 5;
        if (!content.space.bottom) content.space.bottom = 5;

        return scene.rexUI.add.label({
            text: scene.add.text(content.x, content.y, content.text, {
                fontSize: content.fontSize,
                fontFamily: content.fontFamily,
                align: content.align,
            }),

            align: content.align,

            space: {
                left: content.space.left,
                right: content.space.right,
                top: content.space.top,
                bottom: content.space.bottom,
            },
        });
    }

    //create text with background
    createLabel(scene, content) {
        //defaults
        if (!content.x) content.x = 0;
        if (!content.y) content.y = 0;

        if (!content.width) content.width = 40;
        if (!content.height) content.height = 40;

        if (!content.background) content.background = {};
        if (!content.background.radius) content.background.radius = 20;
        if (!content.background.color)
            content.background.color = ColorScheme.Blue;
        if (!content.background.alpha) content.background.alpha = 1;
        if (
            content.background.stroke === undefined ||
            content.background.stroke === true
        )
            content.background.stroke = {};
        if (content.background.stroke)
            content.background.stroke.color = ColorScheme.DarkBlue;
        if (content.background.stroke) content.background.stroke.width = 3;
        if (content.background.stroke)
            content.background.stroke.transparency = 1;

        if (!content.fontSize) content.fontSize = 12;

        if (!content.align) content.align = 'center';

        if (!content.fontFamily) content.fontFamily = 'Burbin';

        if (!content.space) content.space = {};
        if (!content.space.left) content.space.left = 10;
        if (!content.space.right) content.space.right = 10;
        if (!content.space.top) content.space.top = 10;
        if (!content.space.bottom) content.space.bottom = 10;

        //has icon
        if (content.icon) {
            return scene.rexUI.add.label({
                x: content.x,
                y: content.y,

                width: content.width,
                height: content.height,

                background: scene.add.rexRoundRectangle({
                    x: 0,
                    y: 0,
                    width: content.width,
                    height: content.height,
                    radius: content.background.radius,
                    color: content.background.color,
                    alpha: content.background.transparency,

                    strokeColor: content.background.stroke
                        ? content.background.stroke.color
                        : undefined,
                    strokeAlpha: content.background.stroke
                        ? content.background.stroke.transparency
                        : undefined,
                    strokeWidth: content.background.stroke
                        ? content.background.stroke.width
                        : undefined,
                }),

                icon: scene.add.sprite(
                    content.width,
                    content.height,
                    content.icon
                ),

                text: scene.add.text(0, 0, content.text, {
                    fontSize: content.fontSize,
                    fontFamily: content.fontFamily,
                }),

                align: content.align,

                space: {
                    left: content.space.left,
                    right: content.space.right,
                    top: content.space.top,
                    bottom: content.space.bottom,
                },
            });

            //no icon
        } else {
            return scene.rexUI.add.label({
                x: content.x,
                y: content.y,

                width: content.width,
                height: content.height,

                background: scene.add.rexRoundRectangle({
                    x: 0,
                    y: 0,
                    width: content.width,
                    height: content.height,
                    radius: content.background.radius,
                    color: content.background.color,
                    alpha: content.background.transparency,

                    strokeColor: content.background.stroke
                        ? content.background.stroke.color
                        : undefined,
                    strokeAlpha: content.background.stroke
                        ? content.background.stroke.transparency
                        : undefined,
                    strokeWidth: content.background.stroke
                        ? content.background.stroke.width
                        : undefined,
                }),

                text: scene.add.text(0, 0, content.text, {
                    fontSize: content.fontSize,
                    fontFamily: content.fontFamily,
                }),

                align: content.align,

                space: {
                    left: content.space.left,
                    right: content.space.right,
                    top: content.space.top,
                    bottom: content.space.bottom,
                },
            });
        }
    }

    //create toast message
    createToast(scene, option) {
        //defaults
        if (!option.x) option.x = scene.sys.game.canvas.width / 2;
        if (!option.y) option.y = scene.sys.game.canvas.height / 2;

        if (!option.fontSize) option.fontSize = '24px';
        if (!option.fontFamily) option.fontFamily = 'Burbin';
        if (!option.color)
            option.color = utility.hexIntegerToString(ColorScheme.White);

        if (!option.background) option.background = {};
        if (!option.background.color)
            option.background.color = ColorScheme.Blue;
        if (!option.background.radius) option.background.radius = 15;

        if (!option.duration) option.duration = {};
        if (!option.duration.in) option.duration.in = 200;
        if (!option.duration.hold) {
            let textLength = option.text.length;
            if (textLength * 100 < 3000) {
                option.duration.hold = 3000;
            } else {
                if (textLength * 100 < 8000) {
                    option.duration.hold = textLength * 100;
                } else {
                    option.duration.hold = 8000;
                }
            }
        }
        if (!option.duration.out) option.duration.out = 200;

        if (!option.space) option.space = {};
        if (!option.space.left) option.space.left = 10;
        if (!option.space.right) option.space.right = 10;
        if (!option.space.top) option.space.top = 10;
        if (!option.space.bottom) option.space.bottom = 10;

        var toast = scene.rexUI.add
            .toast({
                x: option.x,
                y: option.y,

                background: scene.add.rexRoundRectangle({
                    x: 0,
                    y: 0,
                    width: 2,
                    height: 2,
                    radius: option.background.radius,
                    color: option.background.color,
                    alpha: option.background.transparency,

                    strokeColor: option.background.stroke
                        ? option.background.stroke.color
                        : undefined,
                    strokeAlpha: option.background.stroke
                        ? option.background.stroke.transparency
                        : undefined,
                    strokeWidth: option.background.stroke
                        ? option.background.stroke.width
                        : undefined,
                }),

                text: scene.add.text(0, 0, '', {
                    fontSize: option.fontSize,
                    fontFamily: option.fontFamily,
                    color: option.color,
                }),

                space: {
                    left: option.space.left,
                    right: option.space.right,
                    top: option.space.top,
                    bottom: option.space.bottom,
                },

                duration: {
                    in: option.duration.in,
                    hold: option.duration.hold,
                    out: option.duration.out,
                },
            })
            .showMessage(option.text)
            .setDepth(scene.depthUI);

        return toast;
    }

    //create slider
    createSlider(scene, content) {
        //defaults
        if (!content.x) content.x = 0;
        if (!content.y) content.y = 0;
        if (!content.width) content.width = 300;
        if (!content.height) content.height = 30;
        if (!content.orientation) content.orientation = 'x';

        if (!content.value) content.value = 0;

        if (!content.trackX) content.trackX = 0;
        if (!content.trackY) content.trackY = 0;
        if (!content.trackWidth) content.trackWidth = 0;
        if (!content.trackHeight) content.trackHeight = 0;
        if (!content.trackRadius) content.trackRadius = 10;
        if (!content.trackColor) content.trackColor = ColorScheme.Blue;
        if (!content.trackTransparency) content.trackTransparency = 1;

        if (!content.indicatorX) content.indicatorX = 0;
        if (!content.indicatorY) content.indicatorY = 0;
        if (!content.indicatorWidth) content.indicatorWidth = 0;
        if (!content.indicatorHeight) content.indicatorHeight = 0;
        if (!content.indicatorRadius) content.indicatorRadius = 10;
        if (!content.indicatorColor)
            content.indicatorColor = ColorScheme.LightBlue;
        if (!content.indicatorTransparency) content.indicatorTransparency = 1;

        if (!content.thumbX) content.thumbX = 0;
        if (!content.thumbY) content.thumbY = 0;
        if (!content.thumbWidth) content.thumbWidth = 0;
        if (!content.thumbHeight) content.thumbHeight = 0;
        if (!content.thumbRadius) content.thumbRadius = 12;
        if (!content.thumbColor) content.thumbColor = ColorScheme.White;
        if (!content.thumbTransparency) content.thumbTransparency = 1;

        if (!content.space) content.space = {};
        if (!content.space.left) content.space.left = 0;
        if (!content.space.right) content.space.right = 0;
        if (!content.space.top) content.space.top = 5;
        if (!content.space.bottom) content.space.bottom = 5;

        if (!content.input) content.input = 'click';

        let slider = scene.rexUI.add
            .slider({
                x: content.x,
                y: content.y,
                width: content.width,
                height: content.height,
                orientation: content.orientation,

                value: content.value,

                track: scene.add.rexRoundRectangle(
                    content.trackX,
                    content.trackY,
                    content.trackWidth,
                    content.trackHeight,
                    content.trackRadius,
                    content.trackColor,
                    content.trackTransparency
                ),
                indicator: scene.add.rexRoundRectangle(
                    content.indicatorX,
                    content.indicatorY,
                    content.indicatorWidth,
                    content.indicatorHeight,
                    content.indicatorRadius,
                    content.indicatorColor,
                    content.indicatorTransparency
                ),
                thumb: scene.add.rexRoundRectangle(
                    content.thumbX,
                    content.thumbY,
                    content.thumbWidth,
                    content.thumbHeight,
                    content.thumbRadius,
                    content.thumbColor,
                    content.thumbTransparency
                ),

                space: {
                    left: content.space.left,
                    right: content.space.right,
                    top: content.space.top,
                    bottom: content.space.bottom,
                },

                easeValue: {
                    duration: 100,
                },

                input: content.input, // 'drag'|'click'
            })
            .layout();

        //events
        slider.on(
            'valuechange',
            function (value, oldValue, slider) {
                //callback
                content.onSliderChange(value);
            },
            scene
        );

        return slider;
    }

    //create input box
    createInputBox(scene, option, useSizer = false) {
        //defaults
        if (!option.x) option.x = 0;
        if (!option.y) option.y = 0;
        if (!option.width) option.width = 500;
        if (!option.height) option.height = 40;
        if (!option.type) option.type = 'text';
        if (!option.text) option.text = '';
        if (!option.placeholder) option.placeholder = '';
        if (!option.fontSize) option.fontSize = 24;
        if (!option.color) option.color = ColorScheme.Black;

        if (!option.background) option.background = {};
        if (!option.background.color)
            option.background.color = ColorScheme.White;
        if (!option.background.radius) option.background.radius = 0;
        if (
            option.background.stroke === undefined ||
            option.background.stroke === true
        )
            option.background.stroke = {};
        if (option.background.stroke && !option.background.stroke.color)
            option.background.stroke.color = ColorScheme.DarkerBlue;
        if (option.background.stroke && !option.background.stroke.width)
            option.background.stroke.width = 2;
        if (option.background.stroke && !option.background.stroke.transparency)
            option.background.stroke.transparency = 1;
        if (!option.background.space) option.background.space = {};
        if (!option.background.space.left) option.background.space.left = 5;
        if (!option.background.space.right) option.background.space.right = 5;
        if (!option.background.space.top) option.background.space.top = 0;
        if (!option.background.space.bottom) option.background.space.bottom = 0;

        if (!option.border) option.border = 0;
        if (!option.borderColor) option.borderColor = ColorScheme.Black;
        if (!option.spellCheck) option.spellCheck = false;
        if (!option.autoComplete) option.autoComplete = 'off';
        if (!option.maxLength) option.maxLength = 1000;

        //create input box
        let inputBox = scene.add.rexInputText({
            x: option.x,
            y: option.y,
            width: option.width,
            height: option.height,
            id: option.id,
            type: option.type,
            text: option.text,
            placeholder: option.placeholder,
            fontSize: option.fontSize,
            color: option.color,
            spellCheck: option.spellCheck,
            autoComplete: option.autoComplete,
            maxLength: option.maxLength,
        });

        //events
        if (option.onFocus) {
            inputBox.on(
                'focus',
                function (inputBox, event) {
                    //callback
                    option.onFocus(inputBox, event);
                },
                scene
            );
        }
        if (option.onKeydown) {
            inputBox.on(
                'keydown',
                function (inputBox, event) {
                    //callback
                    option.onKeydown(inputBox, event);
                },
                scene
            );
        }

        //sizer backgound
        if (useSizer) {
            //create parent and background object
            var sizer = scene.rexUI.add
                .sizer({
                    orientation: 0,
                })
                .addBackground(
                    scene.add.rexRoundRectangle({
                        x: option.x - option.background.space.left / 2,
                        y: option.y + option.background.space.bottom / 2,
                        width:
                            option.width +
                            (option.background.space.left +
                                option.background.space.right),
                        height:
                            option.height +
                            (option.background.space.top +
                                option.background.space.bottom),
                        radius: option.background.radius,
                        color: option.background.color,
                        alpha: 1,

                        strokeColor: option.background.stroke
                            ? option.background.stroke.color
                            : undefined,
                        strokeAlpha: option.background.stroke
                            ? option.background.stroke.transparency
                            : undefined,
                        strokeWidth: option.background.stroke
                            ? option.background.stroke.width
                            : undefined,
                    })
                );

            //add input box to parent
            sizer.add(inputBox);
            return sizer;
        }

        //normal background
        else {
            scene.add
                .rexRoundRectangle({
                    x: option.x - option.background.space.left / 2,
                    y: option.y + option.background.space.bottom / 2,
                    width:
                        option.width +
                        (option.background.space.left +
                            option.background.space.right),
                    height:
                        option.height +
                        (option.background.space.top +
                            option.background.space.bottom),
                    radius: option.background.radius,
                    color: option.background.color,
                    alpha: 1,

                    strokeColor: option.background.stroke
                        ? option.background.stroke.color
                        : undefined,
                    strokeAlpha: option.background.stroke
                        ? option.background.stroke.transparency
                        : undefined,
                    strokeWidth: option.background.stroke
                        ? option.background.stroke.width
                        : undefined,
                })
                .setDepth(option.depth);
            return inputBox;
        }
    }

    //create button
    createButtons(scene, content) {
        //defaults
        if (!content.x) content.x = 0;
        if (!content.y) content.y = 0;
        if (!content.width) content.width = 20;
        if (!content.height) content.height = 20;
        if (!content.align) content.align = 'center';
        if (!content.orientation) content.orientation = 'x';
        if (!content.color) content.color = ColorScheme.Blue;
        if (!content.colorOnHover) content.colorOnHover = ColorScheme.LightBlue;
        if (!content.space) content.space = {};
        if (!content.space.left) content.space.left = 0;
        if (!content.space.right) content.space.right = 0;
        if (!content.space.top) content.space.top = 0;
        if (!content.space.bottom) content.space.bottom = 0;
        if (!content.space.item) content.space.item = 5;

        var buttonsData = [];
        for (let i = 0; i < content.buttons.length; i++) {
            //get action content
            const buttonsContent = content.buttons[i];

            //defaults
            if (!buttonsContent.align) buttonsContent.align = 'center';
            if (!buttonsContent.width) buttonsContent.width = 20;
            if (!buttonsContent.height) buttonsContent.height = 20;

            if (!buttonsContent.background) buttonsContent.background = {};
            if (!buttonsContent.background.radius)
                buttonsContent.background.radius = 20;
            if (!buttonsContent.background.color)
                buttonsContent.background.color = ColorScheme.Blue;
            if (!buttonsContent.background.alpha)
                buttonsContent.background.alpha = 1;
            if (!buttonsContent.space) buttonsContent.space = {};
            if (!buttonsContent.space.left) buttonsContent.space.left = 0;
            if (!buttonsContent.space.right) buttonsContent.space.right = 0;
            if (!buttonsContent.space.top) buttonsContent.space.top = 0;
            if (!buttonsContent.space.bottom) buttonsContent.space.bottom = 0;
            if (!buttonsContent.space.item) buttonsContent.space.item = 0;

            //add to buttons
            buttonsData.push(
                this.createLabel(scene, {
                    x: buttonsContent.x,
                    y: buttonsContent.y,
                    icon: buttonsContent.icon,
                    text: buttonsContent.text,
                    fontSize: content.fontSize,
                    align: buttonsContent.align,
                    background: {
                        radius: buttonsContent.background.radius,
                        color: buttonsContent.background.color,
                        alpha: buttonsContent.background.alpha,
                    },
                    width: buttonsContent.width,
                    height: buttonsContent.height,
                    space: {
                        left: content.space.left,
                        right: content.space.right,
                        top: content.space.top,
                        bottom: content.space.bottom,
                    },
                })
            );
        }

        let buttons = scene.rexUI.add
            .buttons({
                x: content.x,
                y: content.y,

                width: content.width,
                height: content.height,

                orientation: content.orientation,

                buttons: buttonsData,
                expand: false,
                align: content.align,
                click: {
                    mode: 'pointerup',
                    clickInterval: 100,
                },

                space: {
                    left: content.space.left,
                    right: content.space.right,
                    top: content.space.top,
                    bottom: content.space.bottom,
                    item: content.space.item,
                },
            })
            .layout();

        //animation
        buttons
            .on(
                'button.over',
                function (button, groupName, index, pointer, event) {
                    button
                        .getElement('background')
                        .setFillStyle(content.colorOnHover);
                },
                scene
            )
            .on(
                'button.out',
                function (button, groupName, index, pointer, event) {
                    button.getElement('background').setFillStyle(content.color);
                },
                scene
            );

        //events
        buttons.on(
            'button.click',
            function (button, index, pointer, event) {
                //sfx
                scene.sfxButtonClick.play();

                //callback per button
                if (content.buttons[index].onClick)
                    content.buttons[index].onClick(
                        index,
                        button,
                        pointer,
                        event
                    );
                //callback for all buttons
                if (content.onClick) content.onClick(index, button);
            },
            scene
        );

        return buttons;
    }

    //create color picker
    createColorPicker(scene, option) {
        //defaults
        if (!option.x) option.x = 0;
        if (!option.y) option.y = 0;

        if (!option.width) option.width = 400;
        if (!option.height) option.height = 30;

        //random value
        let sliderValue = Math.random();

        //create background
        var background = scene.add.rexRoundRectangle({
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            radius: 8,
            color: ColorScheme.Blue,
            alpha: 1,

            strokeColor: ColorScheme.DarkBlue,
            strokeAlpha: 1,
            strokeWidth: 2,
        });

        //create color strip
        var colorStrip = scene.rexUI.add.canvas(
            0,
            0,
            option.width,
            option.height
        );
        var ctx = colorStrip.context;
        var grd = ctx.createLinearGradient(0, 0, option.width, 0);
        grd.addColorStop(0, 'rgba(255, 0, 0, 1)');
        grd.addColorStop(0.15, 'rgba(255, 0, 255, 1)');
        grd.addColorStop(0.33, 'rgba(0, 0, 255, 1)');
        grd.addColorStop(0.49, 'rgba(0, 255, 255, 1)');
        grd.addColorStop(0.67, 'rgba(0, 255, 0, 1)');
        grd.addColorStop(0.84, 'rgba(255, 255, 0, 1)');
        grd.addColorStop(1, 'rgba(255, 0, 0, 1)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, option.width, option.height);
        colorStrip.updateTexture();

        //create thumb
        var thumb = scene.add
            .rectangle(0, 0, 20, 30, ColorScheme.White)
            .setStrokeStyle(2, ColorScheme.White);

        //create slider
        var slider = scene.rexUI.add.slider({
            height: 30,
            thumb: thumb,
            input: 'click',
            value: sliderValue,
            easeValue: {
                duration: 100,
            },
        });

        //make slider interactive
        colorStrip.setInteractive().on(
            'pointerdown',
            function (pointer, localX, localY) {
                slider.setValue(localX / colorStrip.width);
            },
            scene
        );

        //events
        slider.on(
            'valuechange',
            function (value, oldValue, slider) {
                //get color
                let color = convertToColor(value);

                //update thumb
                updateThumb(value);

                //callback
                if (option.onSliderChange) option.onSliderChange(color);
            },
            scene
        );

        //create sizer for entire color picker
        var colorPicker = scene.rexUI.add
            .sizer({
                width: option.width,
                height: option.height,
                orientation: 'y',
            })
            .addBackground(background)
            .add(colorStrip)
            .add(slider, { expand: true })
            .setPosition(option.x, option.y)
            .layout();

        //convert slider value to color
        let convertToColor = function (value) {
            var x = (colorStrip.width - 1) * value;
            var color = colorStrip.getPixel(x, 0);
            return color.color;
        };

        //set thumb color to selected color
        let updateThumb = function (value) {
            //convert slider value to color
            let color = convertToColor(value);

            //set thumb color
            thumb.setFillStyle(color);
        };

        //slider init
        // updateThumb();

        return colorPicker;
    }

    //format passage
    formatPassage(scene, element, passage, options = {}) {
        //defaults
        if (!options.fontSize) options.fontSize = 18;
        if (!options.fontFamily) options.fontFamily = 'Burbin';

        //clear text in element
        element.clear(true);

        //split the passage into an array
        var lines = passage.split('\n');

        //add text
        for (var li = 0, lcnt = lines.length; li < lcnt; li++) {
            //get words in the line
            var words = lines[li].split(' ');

            //add text for each line
            for (var wi = 0, wcnt = words.length; wi < wcnt; wi++) {
                element.add(
                    scene.add.text(0, 0, words[wi], {
                        fontSize: options.fontSize,
                        fontFamily: options.fontFamily,
                    })
                );
            }

            //new line if doesnt fit
            if (li < lcnt - 1) {
                element.addNewLine();
            }
        }

        element.layout();
    }

    //create sizer
    createSizer(scene, content = {}, options = {}) {
        //default options
        if (!options.x) options.x = 0;
        if (!options.y) options.y = 0;
        if (!options.width) options.width = 400;
        if (!options.height) options.height = 80;
        if (!options.orientation) options.orientation = 'y';

        if (!options.space) options.space = {};
        if (!options.space.left) options.space.left = 20;
        if (!options.space.right) options.space.right = 20;
        if (!options.space.top) options.space.top = 20;
        if (!options.space.bottom) options.space.bottom = 20;
        if (!options.space.item) options.space.item = 5;

        //init sizer
        var sizer = scene.rexUI.add.sizer({
            x: options.x,
            y: options.y,

            orientation: options.orientation,

            space: {
                left: options.space.left,
                right: options.space.right,
                top: options.space.top,
                bottom: options.space.bottom,
                item: options.space.item,
            },
        });

        //add background
        if (options.background) {
            //default options
            if (!options.background.x) options.background.x = 0;
            if (!options.background.y) options.background.y = 0;
            if (!options.background.radius) options.background.radius = 20;
            if (!options.background.color)
                options.background.color = ColorScheme.DarkBlue;
            if (!options.background.transparency)
                options.background.transparency = 1;
            if (
                options.background.stroke === undefined ||
                options.background.stroke === true
            )
                options.background.stroke = {};
            if (options.background.stroke && !options.background.stroke.color)
                options.background.stroke.color = ColorScheme.DarkerBlue;
            if (options.background.stroke && !options.background.stroke.width)
                options.background.stroke.width = 2;
            if (
                options.background.stroke &&
                !options.background.stroke.transparency
            )
                options.background.stroke.transparency = 1;

            //add background element
            sizer.addBackground(
                scene.add.rexRoundRectangle({
                    x: options.background.x,
                    y: options.background.y,
                    width: 0,
                    height: 0,
                    radius: options.background.radius,
                    color: options.background.color,
                    alpha: options.background.transparency,

                    strokeColor: options.background.stroke
                        ? options.background.stroke.color
                        : undefined,
                    strokeAlpha: options.background.stroke
                        ? options.background.stroke.transparency
                        : undefined,
                    strokeWidth: options.background.stroke
                        ? options.background.stroke.width
                        : undefined,
                })
            );
        }

        //add content
        if (content.content) {
            for (let i = 0; i < content.content.length; i++) {
                //get this internal's content
                const internalContent = content.content[i];

                //defaults
                if (!internalContent.align) {
                    internalContent.align = 'center';
                }

                //custom
                if (internalContent.type == 'custom') {
                    sizer.add(internalContent.custom());
                }

                //add text
                else if (internalContent.type == 'text') {
                    sizer.add(
                        this.createText(scene, {
                            text: internalContent.text,
                            fontSize: internalContent.fontSize,
                            align: internalContent.align,
                        })
                    );
                }

                //add button
                else if (internalContent.type == 'button') {
                    sizer.add(
                        this.createButtons(scene, {
                            align: internalContent.align,
                            fontSize: internalContent.fontSize,
                            buttons: [
                                {
                                    text: internalContent.text,
                                    background: internalContent.background,
                                },
                            ],
                            colorOnHover: internalContent.colorOnHover,
                            onClick: internalContent.onClick,
                        })
                    );
                }

                //add buttons
                else if (internalContent.type == 'buttons') {
                    sizer.add(this.createButtons(scene, internalContent));
                }

                //add input box
                else if (internalContent.type == 'inputBox') {
                    sizer.add(
                        this.createInputBox(scene, internalContent, true)
                    );
                }

                //add checkbox
                else if (internalContent.type == 'checkbox') {
                    //create checkbox
                    let checkbox = scene.rexUI.add.buttons({
                        x: 0,
                        y: 0,
                        orientation: 'y',

                        buttons: [
                            scene.rexUI.add.label({
                                width: 25,
                                height: 25,
                                icon: scene.rexUI.add
                                    .roundRectangle(
                                        0,
                                        0,
                                        25,
                                        25,
                                        5,
                                        ColorScheme.Blue
                                    )
                                    .setStrokeStyle(1, ColorScheme.LightBlue),
                                space: {
                                    left: 0,
                                    right: 0,
                                    icon: 0,
                                },
                                name: 'checkbox',
                            }),
                        ],

                        click: {
                            mode: 'pointerup',
                            clickInterval: 100,
                        },

                        type: 'checkboxes',

                        setButtonStateCallback: function (
                            button,
                            value,
                            previousValue
                        ) {
                            //init
                            if (previousValue === undefined) {
                                //initial look state
                                button
                                    .getElement('icon')
                                    .setFillStyle(
                                        internalContent.initialValue
                                            ? ColorScheme.LightBlue
                                            : undefined
                                    );
                            } else {
                                //show look state of checkbox
                                button
                                    .getElement('icon')
                                    .setFillStyle(
                                        value
                                            ? ColorScheme.LightBlue
                                            : undefined
                                    );

                                //callback
                                internalContent.onClick(value);
                            }
                        },
                        setButtonStateCallbackScope: scene,
                    });

                    //set initial state
                    checkbox.setButtonState(
                        'checkbox',
                        internalContent.initialValue
                    );

                    sizer.add(checkbox);
                }

                //add slider
                else if (internalContent.type == 'slider') {
                    sizer.add(this.createSlider(scene, internalContent));
                }

                //add scrollable panel
                else if (internalContent.type == 'scrollable') {
                    //default options
                    if (!internalContent.x) internalContent.x = 0;
                    if (!internalContent.y) internalContent.y = 0;
                    if (!internalContent.width)
                        internalContent.width = options.width;
                    if (!internalContent.height)
                        internalContent.height = options.height;
                    if (!internalContent.position) internalContent.position = 1;
                    if (!internalContent.space) internalContent.space = {};
                    if (!internalContent.space.left)
                        internalContent.space.left = 3;
                    if (!internalContent.space.right)
                        internalContent.space.right = 3;
                    if (!internalContent.space.top)
                        internalContent.space.top = 3;
                    if (!internalContent.space.bottom)
                        internalContent.space.bottom = 3;
                    if (!internalContent.space.item)
                        internalContent.space.item = 8;
                    if (!internalContent.space.line)
                        internalContent.space.line = 8;

                    //create scrollable panel
                    var panel = scene.rexUI.add.scrollablePanel({
                        x: internalContent.x,
                        y: internalContent.y,

                        width: internalContent.width,
                        height: internalContent.height,

                        mouseWheelScroller: {
                            focus: true,
                            speed: 0.7,
                        },

                        panel: {
                            child: scene.rexUI.add.fixWidthSizer({
                                space: {
                                    left: internalContent.space.left,
                                    right: internalContent.space.right,
                                    top: internalContent.space.top,
                                    bottom: internalContent.space.bottom,
                                    item: internalContent.space.item,
                                    line: internalContent.space.line,
                                },
                            }),

                            mask: {
                                padding: 1,
                            },
                        },

                        slider: {
                            track: scene.add.rexRoundRectangle({
                                x: 0,
                                y: 0,
                                width: 20,
                                height: 10,
                                radius: 10,
                                color: internalContent.track.color,
                            }),
                            thumb: scene.add.rexRoundRectangle({
                                x: 0,
                                y: 0,
                                width: 0,
                                height: 0,
                                radius: 13,
                                color: internalContent.thumb.color,
                            }),
                        },

                        space: {
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,

                            panel: 0,
                        },
                    });

                    this.formatPassage(
                        scene,
                        panel.getElement('panel'),
                        internalContent.text
                    );

                    //add scrollable panel to sizer
                    sizer.add(panel);
                }
            }
        }

        //format sizer
        sizer.layout().setDepth(scene.depthUI);

        // //if sizer has a scrollable panel, return both
        // if (panel) {
        //     return [sizer, panel];
        // }
        // //only return sizer
        // else {
        //     return sizer;
        // }
        return sizer;
    }

    //create dialog box
    createDialog(scene, content, options = {}) {
        //defaults
        if (!options.x) options.x = scene.sys.game.canvas.width / 2;
        if (!options.y) options.y = scene.sys.game.canvas.height / 2;
        if (!options.width) options.width = 500;
        if (!options.height) options.height = 80;
        if (options.draggable == undefined) options.draggable = true;

        if (!options.background) options.background = {};
        if (!options.background.width) options.background.width = 100;
        if (!options.background.height) options.background.width = 100;
        if (!options.background.radius) options.background.radius = 20;
        if (!options.background.color)
            options.background.color = ColorScheme.DarkBlue;
        if (
            options.background.stroke === undefined ||
            options.background.stroke === true
        )
            options.background.stroke = {};
        if (options.background.stroke)
            options.background.stroke.color = ColorScheme.DarkerBlue;
        if (options.background.stroke) options.background.stroke.width = 2;
        if (options.background.stroke)
            options.background.stroke.transparency = 1;

        if (!options.title) options.title = {};
        if (!options.title.fontSize) options.title.fontSize = 48;
        if (!options.title.align) options.title.align = 'center';

        if (!options.description) options.description = {};
        if (!options.description.fontSize) options.description.fontSize = 28;
        if (!options.description.align) options.description.align = 'center';

        if (!options.button) options.button = {};
        if (!options.button.fontSize) options.button.fontSize = 28;
        if (!options.button.align) options.button.align = 'center';
        if (!options.button.color) options.button.color = ColorScheme.Blue;
        if (!options.button.colorOnHover)
            options.button.colorOnHover = ColorScheme.LightBlue;
        if (!options.button.space) options.button.space = {};
        if (!options.button.space.left) options.button.space.left = 10;
        if (!options.button.space.right) options.button.space.right = 10;
        if (!options.button.space.top) options.button.space.top = 8;
        if (!options.button.space.bottom) options.button.space.bottom = 8;

        if (!options.space) options.space = {};
        if (!options.space.left) options.space.left = 20;
        if (!options.space.right) options.space.right = 20;
        if (!options.space.top) options.space.top = -20;
        if (!options.space.bottom) options.space.bottom = -20;
        if (!options.space.title) options.space.title = 10;
        if (!options.space.content) options.space.content = 15;
        if (!options.space.action) options.space.action = 0;

        if (!options.align) options.align = {};
        if (!options.align.title) options.align.title = 'center';
        if (!options.align.options) options.align.options = 'center';
        if (!options.align.actions) options.align.actions = 'center';

        if (!options.animation) options.animation = {};
        if (!options.animation.ease) options.animation.ease = 'Bounce';
        if (!options.animation.duration) options.animation.duration = 100;

        //create elements
        const background = scene.add.rexRoundRectangle({
            x: 0,
            y: 0,
            width: options.background.width,
            height: options.background.height,
            radius: options.background.radius,
            color: options.background.color,
            alpha: 1,

            strokeColor: options.background.stroke
                ? options.background.stroke.color
                : undefined,
            strokeAlpha: options.background.stroke
                ? options.background.stroke.transparency
                : undefined,
            strokeWidth: options.background.stroke
                ? options.background.stroke.width
                : undefined,
        });

        const title = this.createLabel(scene, {
            text: content.title,
            fontSize: options.title.fontSize,
            align: options.title.align,
            background: { color: options.background.color },
        });

        const description = this.createText(scene, {
            text: content.description,
            fontSize: options.description.fontSize,
            align: options.description.align,
        });

        const button = [
            this.createLabel(scene, {
                text: content.button,
                fontSize: options.button.fontSize,
                align: options.button.align,
                background: { color: options.button.color },
                space: {
                    left: options.button.space.left,
                    right: options.button.space.right,
                    top: options.button.space.top,
                    bottom: options.button.space.bottom,
                },
            }),
        ];

        //create dialog
        var dialog = scene.rexUI.add
            .dialog({
                x: options.x,
                y: options.y,

                width: options.width,
                height: options.height,

                background: background,

                title: title,

                content: description,

                actions: button,

                space: {
                    left: options.space.left,
                    right: options.space.right,
                    top: options.space.top,
                    bottom: options.space.bottom,

                    title: options.space.title,
                    content: options.space.content,
                    action: options.space.action,
                },

                expand: {
                    title: false,
                },

                align: {
                    title: options.align.title,
                    options: options.align.options,
                    actions: options.align.actions,
                },

                click: {
                    mode: 'release',
                },
            })
            .layout()
            .popUp(1000)

            //animation
            .on(
                'button.over',
                function (button, groupName, index, pointer, event) {
                    button
                        .getElement('background')
                        .setFillStyle(options.button.colorOnHover);
                },
                scene
            )
            .on(
                'button.out',
                function (button, groupName, index, pointer, event) {
                    button
                        .getElement('background')
                        .setFillStyle(options.button.color);
                },
                scene
            );
        scene.tweens.add({
            targets: dialog,
            scaleX: 1,
            scaleY: 1,
            ease: options.animation.ease, // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: options.animation.duration,
            repeat: 0, // -1: infinity
            yoyo: false,
        });

        //draggable
        if (options.draggable) {
            dialog.setDraggable('background');
        }

        return dialog;
    }

    //create menu (exit button top right, draggable, and filled with sizer and extra content added by the executor)
    createMenu(scene, content, options = {}) {
        //default options
        if (!options.x) options.x = scene.sys.game.canvas.width / 2;
        if (!options.y) options.y = scene.sys.game.canvas.height / 2;
        if (!options.width) options.width = 400;
        if (!options.height) options.height = 200;
        if (options.draggable == undefined) options.draggable = true;

        if (!options.title) options.title = {};
        if (!options.title.fontSize) options.title.fontSize = 30;

        if (!options.background) options.background = {};
        if (!options.background.x) options.background.x = 0;
        if (!options.background.y) options.background.y = 0;
        if (!options.background.width) options.background.width = options.width;
        if (!options.background.height)
            options.background.height = options.height;
        if (!options.background.radius) options.background.radius = 20;
        if (!options.background.color)
            options.background.color = ColorScheme.DarkBlue;
        if (!options.background.transparency)
            options.background.transparency = 1;
        if (
            options.background.stroke === undefined ||
            options.background.stroke === true
        )
            options.background.stroke = {};
        if (options.background.stroke)
            options.background.stroke.color = ColorScheme.DarkerBlue;
        if (options.background.stroke) options.background.stroke.width = 2;
        if (options.background.stroke)
            options.background.stroke.transparency = 1;

        if (!options.space) options.space = {};
        if (!options.space.left) options.space.left = 10;
        if (!options.space.right) options.space.right = 10;
        if (!options.space.top) options.space.top = 0;
        if (!options.space.bottom) options.space.bottom = 0;
        if (!options.space.panel) options.space.panel = 10;
        if (!options.space.item) options.space.item = 0;
        if (!options.space.title) options.space.title = 5;
        if (!options.space.titleLeft) options.space.titleLeft = 30;

        if (!options.exitButton) options.exitButton = {};
        if (!options.exitButton.color)
            options.exitButton.color = ColorScheme.Blue;
        if (!options.exitButton.colorOnHover)
            options.exitButton.colorOnHover = ColorScheme.LightBlue;

        if (options.cover === undefined) options.cover = false;

        //content
        let cover = options.cover
            ? scene.add.rexCover({ alpha: 0.8 }).setDepth(scene.depthUI)
            : undefined;

        const background = scene.add.rexRoundRectangle({
            x: options.background.x,
            y: options.background.y,
            width: options.background.width,
            height: options.background.height,
            radius: options.background.radius,
            color: options.background.color,
            alpha: 1,

            strokeColor: options.background.stroke
                ? options.background.stroke.color
                : undefined,
            strokeAlpha: options.background.stroke
                ? options.background.stroke.transparency
                : undefined,
            strokeWidth: options.background.stroke
                ? options.background.stroke.width
                : undefined,
        });

        const title = this.createText(scene, {
            text: content.title,
            fontSize: options.title.fontSize,
            align: 'center',
        });

        const exitButton = this.createButtons(scene, {
            fontSize: 18,
            buttons: [
                {
                    text: 'X',
                    width: 40,
                    height: 0,
                    background: { radius: 8 },
                },
            ],
            space: {
                top: 5,
                bottom: 5,
            },
        });

        var sizer = this.createSizer(scene, content, {
            width: options.width,
            height: options.height,
            space: {
                top: options.space.top,
                bottom: options.space.bottom,
                left: options.space.left,
                right: options.space.right,
                item: options.space.item,
            },
        });

        //create menu
        var menu = scene.rexUI.add
            .dialog({
                x: options.x,
                y: options.y,

                width: options.width,
                height: options.height,

                background: background,

                title: title,

                toolbar: [exitButton],

                description: sizer,

                space: {
                    left: options.space.left,
                    right: options.space.right,
                    top: options.space.top,
                    bottom: options.space.bottom,

                    title: options.space.title,
                    titleLeft: options.space.titleLeft,
                },

                align: {
                    title: 'center',
                },

                click: {
                    mode: 'release',
                },
            })
            .layout()

            //exit button animation
            .on(
                'button.over',
                function (button, groupName, index, pointer, event) {
                    //exit button
                    if (groupName == 'toolbar' && index == 0) {
                        menu.getToolbar(0)
                            .getButton(0)
                            .getElement('background')
                            .setFillStyle(options.exitButton.colorOnHover);
                    }
                },
                scene
            )
            .on(
                'button.out',
                function (button, groupName, index, pointer, event) {
                    //exit button
                    if (groupName == 'toolbar' && index == 0) {
                        menu.getToolbar(index)
                            .getButton(0)
                            .getElement('background')
                            .setFillStyle(options.exitButton.color);
                    }
                },
                scene
            );

        //draggable
        if (options.draggable) {
            menu.setDraggable('background');
        }

        //close promise + animation
        scene.rexUI.modalPromise(
            //assign menu to promise
            menu.setDepth(scene.depthUI),

            //options
            {
                cover: false,
                duration: {
                    in: 200,
                    out: 200,
                },
            }
        );

        //exit event
        menu.on(
            'button.click',
            function (button, groupName, index, pointer, event) {
                //sfx
                scene.sfxButtonClick.play();

                //remove cover
                if (options.cover) {
                    cover.destroy();
                }

                //close
                menu.emit('modal.requestClose', {
                    index: index,
                    text: button.text,
                });

                //exit callback
                options.onExit(scene);
            },
            scene
        );

        return menu;
    }
}
