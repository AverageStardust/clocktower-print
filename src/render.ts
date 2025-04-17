import { createCanvas } from "https://deno.land/x/canvas@v1.4.2/mod.ts";
import { Config } from "./config.ts";

export async function render(config: Config) {
    const canvas = createCanvas(config.pageWidth * config.pageDpi, config.pageHeight * config.pageDpi);
    const ctx = canvas.getContext("2d");

    //ctx.drawImage()

    //await Deno.writeFile("page.png", canvas.toBuffer());

}