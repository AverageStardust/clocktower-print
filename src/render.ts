import { createCanvas } from "https://deno.land/x/canvas@v1.4.2/mod.ts";
import { mimelite } from "https://deno.land/x/mimetypes@v1.0.0/mod.ts"

import { Config } from "./config.ts";

export async function render(config: Config) {
    const canvas = createCanvas(config.pageWidth * config.pageDpi, config.pageHeight * config.pageDpi);
    const ctx = canvas.getContext("2d");

    //ctx.drawImage()

    //await Deno.writeFile("page.png", canvas.toBuffer());

}

async function loadImage(path: string): Promise<ImageBitmap> {
    const mimeType = mimelite.getType(path);
    if (mimeType === undefined || mimeType!.startsWith("image/"))
        throw Error("Failed to load image file, not an image");

    const bytes = await Deno.readFile(path);
    const blob = new Blob([bytes], { type: mimeType });
    return createImageBitmap(blob);
}
