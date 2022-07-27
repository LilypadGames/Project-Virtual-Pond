// UI Functions

class UI {
    //create text with background
    createText(scene, content) {
        //defaults
        if (!content.x) {
            content.x = 0;
        }
        if (!content.y) {
            content.y = 0;
        }
        if (!content.fontSize) {
            content.fontSize = 12;
        }

        if (!content.align) {
            content.align = 'left';
        }

        if (!content.fontFamily) {
            content.fontFamily = 'Burbin';
        }

        if (!content.space) {
            content.space = {};
        }
        if (!content.space.left) {
            content.space.left = 5;
        }
        if (!content.space.right) {
            content.space.right = 5;
        }
        if (!content.space.top) {
            content.space.top = 5;
        }
        if (!content.space.bottom) {
            content.space.bottom = 5;
        }

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
        if (!content.x) {
            content.x = 0;
        }
        if (!content.y) {
            content.y = 0;
        }

        if (!content.width) {
            content.width = 40;
        }
        if (!content.height) {
            content.height = 40;
        }

        if (!content.backgroundRadius) {
            content.backgroundRadius = 20;
        }
        if (!content.backgroundColor) {
            content.backgroundColor = ColorScheme.Blue;
        }
        if (!content.backgroundTransparency) {
            content.backgroundTransparency = 1;
        }

        if (!content.fontSize) {
            content.fontSize = 12;
        }

        if (!content.align) {
            content.align = 'center';
        }

        if (!content.fontFamily) {
            content.fontFamily = 'Burbin';
        }

        if (!content.space) {
            content.space = {};
        }
        if (!content.space.left) {
            content.space.left = 10;
        }
        if (!content.space.right) {
            content.space.right = 10;
        }
        if (!content.space.top) {
            content.space.top = 10;
        }
        if (!content.space.bottom) {
            content.space.bottom = 10;
        }

        //has icon
        if (content.icon) {
            return scene.rexUI.add.label({
                x: content.x,
                y: content.y,

                width: content.width,
                height: content.height,

                background: scene.rexUI.add.roundRectangle(
                    0,
                    0,
                    content.width,
                    content.height,
                    content.backgroundRadius,
                    content.backgroundColor,
                    content.backgroundTransparency
                ),

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

                background: scene.rexUI.add.roundRectangle(
                    0,
                    0,
                    content.width,
                    content.height,
                    content.backgroundRadius,
                    content.backgroundColor,
                    content.backgroundTransparency
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
        }
    }

    //create slider
    createSlider(scene, content) {
        //defaults
        if (!content.x) {
            content.x = 0;
        }
        if (!content.y) {
            content.y = 0;
        }
        if (!content.width) {
            content.width = 300;
        }
        if (!content.height) {
            content.height = 30;
        }
        if (!content.orientation) {
            content.orientation = 'x';
        }

        if (!content.value) {
            content.value = 0;
        }

        if (!content.trackX) {
            content.trackX = 0;
        }
        if (!content.trackY) {
            content.trackY = 0;
        }
        if (!content.trackWidth) {
            content.trackWidth = 0;
        }
        if (!content.trackHeight) {
            content.trackHeight = 0;
        }
        if (!content.trackRadius) {
            content.trackRadius = 10;
        }
        if (!content.trackColor) {
            content.trackColor = ColorScheme.Blue;
        }
        if (!content.trackTransparency) {
            content.trackTransparency = 1;
        }

        if (!content.indicatorX) {
            content.indicatorX = 0;
        }
        if (!content.indicatorY) {
            content.indicatorY = 0;
        }
        if (!content.indicatorWidth) {
            content.indicatorWidth = 0;
        }
        if (!content.indicatorHeight) {
            content.indicatorHeight = 0;
        }
        if (!content.indicatorRadius) {
            content.indicatorRadius = 10;
        }
        if (!content.indicatorColor) {
            content.indicatorColor = ColorScheme.LightBlue;
        }
        if (!content.indicatorTransparency) {
            content.indicatorTransparency = 1;
        }

        if (!content.thumbX) {
            content.thumbX = 0;
        }
        if (!content.thumbY) {
            content.thumbY = 0;
        }
        if (!content.thumbWidth) {
            content.thumbWidth = 0;
        }
        if (!content.thumbHeight) {
            content.thumbHeight = 0;
        }
        if (!content.thumbRadius) {
            content.thumbRadius = 12;
        }
        if (!content.thumbColor) {
            content.thumbColor = ColorScheme.White;
        }
        if (!content.thumbTransparency) {
            content.thumbTransparency = 1;
        }

        if (!content.space) {
            content.space = {};
        }
        if (!content.space.left) {
            content.space.left = 0;
        }
        if (!content.space.right) {
            content.space.right = 0;
        }
        if (!content.space.top) {
            content.space.top = 5;
        }
        if (!content.space.bottom) {
            content.space.bottom = 5;
        }

        if (!content.input) {
            content.input = 'click';
        }

        return scene.rexUI.add
            .slider({
                x: content.x,
                y: content.y,
                width: content.width,
                height: content.height,
                orientation: content.orientation,

                value: content.value,

                track: scene.rexUI.add.roundRectangle(
                    content.trackX,
                    content.trackY,
                    content.trackWidth,
                    content.trackHeight,
                    content.trackRadius,
                    content.trackColor,
                    content.trackTransparency
                ),
                indicator: scene.rexUI.add.roundRectangle(
                    content.indicatorX,
                    content.indicatorY,
                    content.indicatorWidth,
                    content.indicatorHeight,
                    content.indicatorRadius,
                    content.indicatorColor,
                    content.indicatorTransparency
                ),
                thumb: scene.rexUI.add.roundRectangle(
                    content.thumbX,
                    content.thumbY,
                    content.thumbWidth,
                    content.thumbHeight,
                    content.thumbRadius,
                    content.thumbColor,
                    content.thumbTransparency
                ),

                valuechangeCallback: function (value) {
                    scene.onSliderChange(value, content.id);
                },

                space: {
                    left: content.space.left,
                    right: content.space.right,
                    top: content.space.top,
                    bottom: content.space.bottom,
                },

                input: content.input, // 'drag'|'click'
            })
            .layout();
    }

    //create input box
    createInputBox(scene, content) {
        //defaults
        if (!content.x) {
            content.x = 0;
        }
        if (!content.y) {
            content.y = 0;
        }
        if (!content.width) {
            content.width = 500;
        }
        if (!content.height) {
            content.height = 40;
        }
        if (!content.type) {
            content.type = 'text';
        }
        if (!content.text) {
            content.text = '';
        }
        if (!content.placeholder) {
            content.placeholder = '';
        }
        if (!content.fontSize) {
            content.fontSize = 24;
        }
        if (!content.color) {
            content.color = ColorScheme.Black;
        }
        if (!content.backgroundColor) {
            content.backgroundColor = ColorScheme.White;
        }
        if (!content.backgroundRadius) {
            content.backgroundRadius = 0;
        }
        if (!content.backgroundSpace) {
            content.backgroundSpace = {};
        }
        if (!content.backgroundSpace.left) {
            content.backgroundSpace.left = 5;
        }
        if (!content.backgroundSpace.right) {
            content.backgroundSpace.right = 5;
        }
        if (!content.backgroundSpace.top) {
            content.backgroundSpace.top = 0;
        }
        if (!content.backgroundSpace.bottom) {
            content.backgroundSpace.bottom = 0;
        }
        if (!content.border) {
            content.border = 0;
        }
        if (!content.borderColor) {
            content.borderColor = ColorScheme.Black;
        }
        if (!content.spellCheck) {
            content.spellCheck = false;
        }
        if (!content.autoComplete) {
            content.autoComplete = 'off';
        }
        if (!content.maxLength) {
            content.maxLength = 1000;
        }

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
                maxLength: content.maxLength,
            }
        );

        //create background
        scene.rexUI.add
            .roundRectangle(
                content.x - content.backgroundSpace.left / 2,
                content.y + content.backgroundSpace.bottom / 2,
                content.width +
                    (content.backgroundSpace.left +
                        content.backgroundSpace.right),
                content.height +
                    (content.backgroundSpace.top +
                        content.backgroundSpace.bottom),
                content.backgroundRadius,
                content.backgroundColor,
                1
            )
            .setDepth(content.depth);

        return inputBox;
    }

    //create button
    createButtons(scene, content) {
        //defaults
        if (!content.x) {
            content.x = 0;
        }
        if (!content.y) {
            content.y = 0;
        }

        if (!content.width) {
            content.width = 20;
        }
        if (!content.height) {
            content.height = 20;
        }

        if (!content.align) {
            content.align = 'center';
        }

        if (!content.orientation) {
            content.orientation = 'x';
        }

        // if (!content.buttonTextSize) { content.buttonTextSize = 18; };
        if (!content.buttonColor) {
            content.buttonColor = ColorScheme.Blue;
        }
        if (!content.buttonColorOnHover) {
            content.buttonColorOnHover = ColorScheme.LightBlue;
        }
        if (!content.buttonSpace) {
            content.buttonSpace = {};
        }
        if (!content.buttonSpace.left) {
            content.buttonSpace.left = 0;
        }
        if (!content.buttonSpace.right) {
            content.buttonSpace.right = 0;
        }
        if (!content.buttonSpace.top) {
            content.buttonSpace.top = 0;
        }
        if (!content.buttonSpace.bottom) {
            content.buttonSpace.bottom = 0;
        }

        if (!content.space) {
            content.space = {};
        }
        if (!content.space.left) {
            content.space.left = 0;
        }
        if (!content.space.right) {
            content.space.right = 0;
        }
        if (!content.space.top) {
            content.space.top = 0;
        }
        if (!content.space.bottom) {
            content.space.bottom = 0;
        }
        if (!content.space.item) {
            content.space.item = 5;
        }

        var buttons = [];
        for (let i = 0; i < content.buttons.length; i++) {
            //get action content
            const buttonsContent = content.buttons[i];

            //defaults
            if (!buttonsContent.align) {
                buttonsContent.align = 'center';
            }
            if (!buttonsContent.backgroundWidth) {
                buttonsContent.backgroundWidth = 20;
            }
            if (!buttonsContent.backgroundHeight) {
                buttonsContent.backgroundHeight = 20;
            }

            //add to buttons
            buttons.push(
                this.createLabel(scene, {
                    x: buttonsContent.x,
                    y: buttonsContent.y,
                    icon: buttonsContent.icon,
                    text: buttonsContent.text,
                    fontSize: content.buttonTextSize,
                    align: buttonsContent.align,
                    backgroundColor: content.buttonColor,
                    width: buttonsContent.backgroundWidth,
                    height: buttonsContent.backgroundHeight,
                    backgroundRadius: buttonsContent.backgroundRadius,
                    space: {
                        left: content.buttonSpace.left,
                        right: content.buttonSpace.right,
                        top: content.buttonSpace.top,
                        bottom: content.buttonSpace.bottom,
                    },
                })
            );
        }

        if (!content.align) {
            content.align = 'left';
        }

        if (!content.space) {
            content.space = {};
        }
        if (!content.space.left) {
            content.space.left = 0;
        }
        if (!content.space.right) {
            content.space.right = 0;
        }
        if (!content.space.top) {
            content.space.top = 0;
        }
        if (!content.space.bottom) {
            content.space.bottom = 0;
        }

        return (
            scene.rexUI.add
                .buttons({
                    x: content.x,
                    y: content.y,

                    width: content.width,
                    height: content.height,

                    orientation: content.orientation,

                    buttons: buttons,
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
                .layout()

                //animation
                .on(
                    'button.over',
                    function (button, groupName, index, pointer, event) {
                        button
                            .getElement('background')
                            .setFillStyle(content.buttonColorOnHover);
                    }
                )
                .on(
                    'button.out',
                    function (button, groupName, index, pointer, event) {
                        button
                            .getElement('background')
                            .setFillStyle(content.buttonColor);
                    }
                )
        );
    }

    //create color picker
    createColorPicker(scene, content) {
        //defaults
        if (!content.x) {
            content.x = 0;
        }
        if (!content.y) {
            content.y = 0;
        }

        if (!content.width) {
            content.width = 400;
        }
        if (!content.height) {
            content.height = 60;
        }

        //create background
        var background = scene.rexUI.add.roundRectangle(
            0,
            0,
            content.width,
            content.height,
            8,
            ColorScheme.Blue,
            1
        );

        //create color strip
        var colorStrip = scene.rexUI.add.canvas(
            0,
            0,
            content.width,
            content.height
        );
        var ctx = colorStrip.context;
        var grd = ctx.createLinearGradient(0, 0, content.width, 0);
        grd.addColorStop(0, 'rgba(255, 0, 0, 1)');
        grd.addColorStop(0.15, 'rgba(255, 0, 255, 1)');
        grd.addColorStop(0.33, 'rgba(0, 0, 255, 1)');
        grd.addColorStop(0.49, 'rgba(0, 255, 255, 1)');
        grd.addColorStop(0.67, 'rgba(0, 255, 0, 1)');
        grd.addColorStop(0.84, 'rgba(255, 255, 0, 1)');
        grd.addColorStop(1, 'rgba(255, 0, 0, 1)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, content.width, content.height);
        colorStrip.updateTexture();

        //create thumb
        var thumb = scene.add.rectangle(0, 0, 20, 30);

        //create slider
        var slider = scene.rexUI.add.slider({
            height: 30,
            thumb: thumb,
            input: 'click',
            valuechangeCallback: function (value) {
                //determine color from position
                var x = (colorStrip.width - 1) * value;
                var color = colorStrip.getPixel(x, 0);
                thumb.setFillStyle(color.color);

                //send info to scene
                scene.onSliderChange(color.color, content.sliderID);
            },
        });

        //make slider interactive
        colorStrip
            .setInteractive()
            .on('pointerdown', function (pointer, localX, localY) {
                slider.setValue(localX / colorStrip.width);
            });

        //create sizer for entire color picker
        var colorPicker = scene.rexUI.add
            .sizer({
                width: content.width,
                height: content.height,
                orientation: 'y',
            })
            .addBackground(background)
            .add(colorStrip)
            .add(slider, { expand: true })
            .setPosition(content.x, content.y)
            .layout();

        return colorPicker;
    }

    //format passage
    formatPassage(scene, element, passage, options = {}) {
        //defaults
        if (!options.fontSize) {
            options.fontSize = 18;
        }
        if (!options.fontFamily) {
            options.fontFamily = 'Burbin';
        }

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
        if (!options.x) {
            options.x = 0;
        }
        if (!options.y) {
            options.y = 0;
        }
        if (!options.width) {
            options.width = 400;
        }
        if (!options.height) {
            options.height = 80;
        }
        if (!options.orientation) {
            options.orientation = 'y';
        }

        if (!options.space) {
            options.space = {};
        }
        if (!options.space.left) {
            options.space.left = 20;
        }
        if (!options.space.right) {
            options.space.right = 20;
        }
        if (!options.space.top) {
            options.space.top = 20;
        }
        if (!options.space.bottom) {
            options.space.bottom = 20;
        }
        if (!options.space.item) {
            options.space.item = 5;
        }

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
            if (!options.background.x) {
                options.background.x = 0;
            }
            if (!options.background.y) {
                options.background.y = 0;
            }
            if (!options.background.radius) {
                options.background.radius = 20;
            }
            if (!options.background.color) {
                options.background.color = ColorScheme.DarkBlue;
            }
            if (!options.background.transparency) {
                options.background.transparency = 1;
            }

            sizer.addBackground(
                scene.rexUI.add.roundRectangle(
                    options.background.x,
                    options.background.y,
                    0,
                    0,
                    options.background.radius,
                    options.background.color,
                    options.background.transparency
                )
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

                //add text
                if (internalContent.type == 'text') {
                    sizer.add(
                        this.createText(scene, {
                            text: internalContent.text,
                            fontSize: internalContent.fontSize,
                            align: internalContent.align,
                        })
                    );

                    //add button
                } else if (internalContent.type == 'button') {
                    sizer.add(
                        this.createButtons(scene, {
                            align: internalContent.align,
                            buttonTextSize: internalContent.fontSize,
                            buttons: [{ text: internalContent.text }],
                        }).on(
                            'button.click',
                            () => {
                                internalContent.onClick();
                            },
                            scene
                        )
                    );

                    //add checkbox
                } else if (internalContent.type == 'checkbox') {
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
                            console.log(
                                'Previous: ' +
                                    previousValue +
                                    ' Value: ' +
                                    value
                            );
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
                    });

                    //set initial state
                    checkbox.setButtonState(
                        'checkbox',
                        internalContent.initialValue
                    );

                    sizer.add(checkbox);

                    //add slider
                } else if (internalContent.type == 'slider') {
                    sizer.add(
                        this.createSlider(scene, {
                            id: internalContent.id,
                            value: internalContent.value,
                        })
                    );

                    //add scrollable panel
                } else if (internalContent.type == 'scrollable') {
                    //default options
                    if (!internalContent.x) {
                        internalContent.x = 0;
                    }
                    if (!internalContent.y) {
                        internalContent.y = 0;
                    }
                    if (!internalContent.width) {
                        internalContent.width = options.width;
                    }
                    if (!internalContent.height) {
                        internalContent.height = options.height;
                    }
                    if (!internalContent.position) {
                        internalContent.position = 1;
                    }
                    if (!internalContent.space) {
                        internalContent.space = {};
                    }
                    if (!internalContent.space.left) {
                        internalContent.space.left = 3;
                    }
                    if (!internalContent.space.right) {
                        internalContent.space.right = 3;
                    }
                    if (!internalContent.space.top) {
                        internalContent.space.top = 3;
                    }
                    if (!internalContent.space.bottom) {
                        internalContent.space.bottom = 3;
                    }
                    if (!internalContent.space.item) {
                        internalContent.space.item = 8;
                    }
                    if (!internalContent.space.line) {
                        internalContent.space.line = 8;
                    }

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
                            track: scene.rexUI.add.roundRectangle(
                                0,
                                0,
                                20,
                                10,
                                10,
                                internalContent.track.color
                            ),
                            thumb: scene.rexUI.add.roundRectangle(
                                0,
                                0,
                                0,
                                0,
                                13,
                                internalContent.thumb.color
                            ),
                        },

                        space: {
                            left: options.space.left,
                            right: options.space.right,
                            top: options.space.top,
                            bottom: options.space.bottom,

                            panel: options.space.panel,
                        },
                    });

                    this.formatPassage(
                        scene,
                        panel.getElement('panel'),
                        internalContent.text
                    );

                    sizer.add(panel);
                }
            }
        }

        return [sizer.setDepth(scene.depthUI), panel];
    }

    //create dialog box
    createDialog(
        scene,
        content,
        options = {
            background: {},
            title: {},
            description: {},
            button: { space: {} },
            space: {},
            expand: {},
            align: {},
            animation: {},
        }
    ) {
        //defaults
        if (!options.x) {
            options.x = scene.canvas.width / 2;
        }
        if (!options.y) {
            options.y = scene.canvas.height / 2;
        }
        if (!options.width) {
            options.width = 500;
        }
        if (!options.height) {
            options.height = 80;
        }
        if (options.draggable == undefined) {
            options.draggable = true;
        }

        if (!options.background.width) {
            options.background.width = 100;
        }
        if (!options.background.height) {
            options.background.width = 100;
        }
        if (!options.background.radius) {
            options.background.radius = 20;
        }
        if (!options.background.color) {
            options.background.color = ColorScheme.DarkBlue;
        }

        if (!options.title.fontSize) {
            options.title.fontSize = 48;
        }
        if (!options.title.align) {
            options.title.align = 'center';
        }

        if (!options.description.fontSize) {
            options.description.fontSize = 28;
        }
        if (!options.description.align) {
            options.description.align = 'center';
        }

        if (!options.button.fontSize) {
            options.button.fontSize = 28;
        }
        if (!options.button.align) {
            options.button.align = 'center';
        }
        if (!options.button.color) {
            options.button.color = ColorScheme.Blue;
        }
        if (!options.button.colorOnHover) {
            options.button.colorOnHover = ColorScheme.LightBlue;
        }
        if (!options.button.space.left) {
            options.button.space.left = 10;
        }
        if (!options.button.space.right) {
            options.button.space.right = 10;
        }
        if (!options.button.space.top) {
            options.button.space.top = 8;
        }
        if (!options.button.space.bottom) {
            options.button.space.bottom = 8;
        }

        if (!options.space.left) {
            options.space.left = 20;
        }
        if (!options.space.right) {
            options.space.right = 20;
        }
        if (!options.space.top) {
            options.space.top = -20;
        }
        if (!options.space.bottom) {
            options.space.bottom = -20;
        }
        if (!options.space.title) {
            options.space.title = 10;
        }
        if (!options.space.content) {
            options.space.content = 15;
        }
        if (!options.space.action) {
            options.space.action = 0;
        }

        if (!options.align.title) {
            options.align.title = 'center';
        }
        if (!options.align.options) {
            options.align.options = 'center';
        }
        if (!options.align.actions) {
            options.align.actions = 'center';
        }

        if (!options.animation.ease) {
            options.animation.ease = 'Bounce';
        }
        if (!options.animation.duration) {
            options.animation.duration = 100;
        }

        //create elements
        const background = scene.rexUI.add.roundRectangle(
            0,
            0,
            options.background.width,
            options.background.height,
            options.background.radius,
            options.background.color,
            1
        );

        const title = this.createLabel(scene, {
            text: content.title,
            fontSize: options.title.fontSize,
            align: options.title.align,
            backgroundColor: options.background.color,
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
                backgroundColor: options.button.color,
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
                }
            )
            .on(
                'button.out',
                function (button, groupName, index, pointer, event) {
                    button
                        .getElement('background')
                        .setFillStyle(options.button.color);
                }
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
    createMenu(
        scene,
        content,
        options = { title: {}, background: {}, space: {} }
    ) {
        //default options
        if (!options.x) {
            options.x = scene.canvas.width / 2;
        }
        if (!options.y) {
            options.y = scene.canvas.height / 2;
        }
        if (!options.width) {
            options.width = 400;
        }
        if (!options.height) {
            options.height = 200;
        }
        if (options.draggable == undefined) {
            options.draggable = true;
        }

        if (!options.title) {
            options.title = {};
        }
        if (!options.title.fontSize) {
            options.title.fontSize = 30;
        }

        if (!options.background) {
            options.background = {};
        }
        if (!options.background.x) {
            options.background.x = 0;
        }
        if (!options.background.y) {
            options.background.y = 0;
        }
        if (!options.background.width) {
            options.background.width = options.width;
        }
        if (!options.background.height) {
            options.background.height = options.height;
        }
        if (!options.background.radius) {
            options.background.radius = 20;
        }
        if (!options.background.color) {
            options.background.color = ColorScheme.DarkBlue;
        }
        if (!options.background.transparency) {
            options.background.transparency = 1;
        }

        if (!options.space) {
            options.space = {};
        }
        if (!options.space.left) {
            options.space.left = 10;
        }
        if (!options.space.right) {
            options.space.right = 10;
        }
        if (!options.space.top) {
            options.space.top = 0;
        }
        if (!options.space.bottom) {
            options.space.bottom = 0;
        }
        if (!options.space.panel) {
            options.space.panel = 10;
        }
        if (!options.space.item) {
            options.space.item = 0;
        }
        if (!options.space.title) {
            options.space.title = 5;
        }
        if (!options.space.titleLeft) {
            options.space.titleLeft = 30;
        }

        if (!options.exitButton) {
            options.exitButton = {};
        }
        if (!options.exitButton.color) {
            options.exitButton.color = ColorScheme.Blue;
        }
        if (!options.exitButton.colorOnHover) {
            options.exitButton.colorOnHover = ColorScheme.LightBlue;
        }

        if (!options.cover) {
            options.cover = false;
        }

        //content
        const background = scene.rexUI.add.roundRectangle(
            options.background.x,
            options.background.y,
            options.background.width,
            options.background.height,
            options.background.radius,
            options.background.color,
            options.background.transparency
        );

        const title = this.createText(scene, {
            text: content.title,
            fontSize: options.title.fontSize,
            align: 'center',
        });

        const exitButton = this.createButtons(scene, {
            buttonTextSize: 22,
            buttons: [
                {
                    x: 10,
                    y: -10,
                    text: 'X',
                    backgroundRadius: 8,
                    buttonColor: options.exitButton.color,
                    buttonColorOnHover: options.exitButton.colorOnHover,
                },
            ],
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
        sizer = sizer[0];

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
                        console.log(menu.getToolbar(index));
                        menu.getToolbar(index)
                            .getElement('background')
                            .setFillStyle(options.exitButton.colorOnHover);
                    }
                }
            )
            .on(
                'button.out',
                function (button, groupName, index, pointer, event) {
                    //exit button
                    if (groupName == 'toolbar' && index == 0) {
                        menu.getToolbar(index)
                            .getElement('background')
                            .setFillStyle(options.exitButton.color);
                    }
                }
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
                cover: options.cover,
                duration: {
                    in: 200,
                    out: 200,
                },
            }
        );

        //set UI depth
        // menu.setDepth(scene.depthUI);

        return menu;
    }
}
