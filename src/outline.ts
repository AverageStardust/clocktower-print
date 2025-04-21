import { Config } from "./config.ts";

interface Circle {
    x: number;
    y: number;
    radius: number;
}

export class Outline {
    config: Config;
    circles: Circle[] = [];
    mmPerPixel: number;

    constructor(config: Config) {
        this.config = config;
        this.mmPerPixel = 25.4 / config.pageDpi;
    }

    addCircle(x: number, y: number, radius: number) {
        x *= this.mmPerPixel;
        y *= this.mmPerPixel;
        radius *= this.mmPerPixel;
        this.circles.push({ x, y, radius });
    }

    toString() {
        const contents = [];

        for (const { x, y, radius } of this.circles) {
            contents.push(`<circle cx="${x}mm" cy="${y}mm" r="${radius}mm" fill="transparent" stroke="black" stroke-width="${this.config.cutWidth}mm"></circle>`)
        }

        return `<svg width="${this.config.pageWidth}mm" height="${this.config.pageHeight}mm">${contents.join("")}</svg>`;
    }
}