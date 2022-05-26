// Color Scheme

class ColorScheme {
    get White() {
        return this.constructor.White;
    };
    get Black() {
        return this.constructor.Black;
    };
    get LightBlue() {
        return this.constructor.LightBlue;
    };
    get Blue() {
        return this.constructor.Blue;
    };
    get DarkBlue() {
        return this.constructor.DarkBlue;
    };
}

//determine colors
ColorScheme.White = 0xffffff;
ColorScheme.Black = 0x000000;
ColorScheme.LightBlue = 0x5e92f3;
ColorScheme.Blue = 0x1883ED;
ColorScheme.DarkBlue = 0x1563BB;