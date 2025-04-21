import { createCanvas, Image, EmulatedCanvas2D, EmulatedCanvas2DContext, loadImage } from "https://deno.land/x/canvas@v1.4.2/mod.ts";

import { Config } from "./config.ts";

type HexRendererGenerator = Generator<EmulatedCanvas2D | null, EmulatedCanvas2D | null, TokenDraw | null>;

interface TokenDraw {
    image: Image;
    printRadius: number;
}

export class HexRenderer {
    private _generator: HexRendererGenerator | null = null;
    private imageLoader = new ImageLoader()
    private pageCount!: number;
    private fileTitle!: string;

    private get generator(): HexRendererGenerator {
        if (this._generator === null)
            throw Error("Page render is not in progress");
        return this._generator;
    }

    private set generator(generator: HexRendererGenerator | null) {
        this._generator = generator;
    }

    async renderConfig(config: Config) {
        console.log("Rendering... starting");
        this.startRender(config);

        let renderCount = 0;

        // draw characters
        for (const script of config.scripts) {
            for (const { characterCount, characterImagePath } of script.tokens) {
                for (let i = 0; i < characterCount; i++) {
                    renderCount++;
                    console.clear();
                    console.log(`Rendering... drawing ${script.title} charactors ${renderCount}/${config.totalCount}`);

                    await this.addToken(characterImagePath, config.characterPrintRadius);
                }
            }
        }

        // draw reminders
        for (const script of config.scripts) {
            for (const token of script.tokens) {
                for (let i = 0; i < token.reminderImagePaths.length; i++) {
                    const count = token.reminderCounts[i];
                    const path = token.reminderImagePaths[i];

                    for (let j = 0; j < count; j++) {
                        renderCount++;
                        console.clear();
                        console.log(`Rendering... drawing ${script.title} reminders ${renderCount}/${config.totalCount}`);

                        await this.addToken(path, config.reminderPrintRadius);
                    }
                }
            }
        }

        await this.finishRender();
    }

    startRender(config: Config) {
        this.generator = this.createGenerator(config);
        this.pageCount = 0;
        this.fileTitle = config.title;
    }

    async addToken(path: string, printRadius: number) {
        const image = await this.imageLoader.get(path, printRadius * 2, printRadius * 2);
        const { value: page, done } = this.generator.next({ image, printRadius });

        if (done)
            throw Error("Generator unexpectedly ended");

        await this.savePage(page);
    }

    async finishRender() {
        const { value: page, done } = this.generator.next(null);

        if (!done)
            throw Error("Generator unexpectedly continued");

        await this.savePage(page);
        this.generator = null;
    }

    private async savePage(page: EmulatedCanvas2D | null) {
        if (page === null) return;

        console.clear();
        console.log(`Rendering... saving page ${this.pageCount + 1}`);

        await Deno.writeFile(`${this.fileTitle} page ${this.pageCount + 1}.png`, page.toBuffer());
        this.pageCount++;
    }

    private * createGenerator(config: Config): HexRendererGenerator {
        const pixelsPerMm = config.pageDpi / 25.4;
        const pageWidth = Math.ceil(config.pageWidth * pixelsPerMm);
        const pageHeight = Math.ceil(config.pageHeight * pixelsPerMm);

        // current token being drawn
        let tokenDraw = yield null;

        // current location in the page we are drawing
        let drawX = 0, drawY = 0;

        // radius of tokens in the current row being drawn
        let rowRadius = (tokenDraw?.printRadius ?? 0) * pixelsPerMm;

        // if this row is offset to make hex grid
        let isRowOffset = false;

        // current page and context being drawn to
        let page: EmulatedCanvas2D | null = null;
        let ctx: EmulatedCanvas2DContext | null = null;

        // previous page that just finished drawing
        let finishedPage: EmulatedCanvas2D | null = null;

        while (tokenDraw !== null) {
            // move to next row if token radius changes
            const tokenRadius = tokenDraw.printRadius * pixelsPerMm;
            if (rowRadius !== tokenRadius) {
                drawX = 0;
                drawY += rowRadius * 2;
                isRowOffset = false;
                rowRadius = tokenRadius;
            }

            // move to next row if we are past the right edge of the page
            if (drawX + tokenRadius * 2 > pageWidth) {
                isRowOffset = !isRowOffset; // alternate offset rows
                drawX = isRowOffset ? tokenRadius : 0;
                drawY += tokenRadius * Math.sqrt(3);
            }

            // move to next page if we are past the bottom edge of the page
            if (drawY + tokenRadius * 2 > pageHeight) {
                // flip page
                finishedPage = page;
                page = null;
                ctx = null;

                // reset drawing
                drawX = 0;
                drawY = 0;
                isRowOffset = false;
            }

            // do we need to make a new page?
            if (page === null || ctx === null) {
                page = createCanvas(pageWidth, pageHeight);
                if (page === null)
                    throw Error("Failed to make canvas");
                ctx = page.getContext("2d");

                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, pageWidth, pageHeight);
            }

            // draw token
            ctx.drawImage(tokenDraw.image, drawX, drawY, tokenRadius * 2, tokenRadius * 2);

            // move to next token location
            drawX += tokenRadius * 2;

            // yeild finished page, assuming it's not null, and get next token
            tokenDraw = yield finishedPage;
            finishedPage = null;
        }

        // return partial page, assuming it's not null
        return page;
    }
}

class ImageLoader {
    private imageCache: Map<string, Image> = new Map();

    async get(path: string, width: number, height: number): Promise<Image> {
        // check cache first
        const cacheKey = `${path}|${width}|${height}`
        let image = this.imageCache.get(cacheKey);

        // return if found
        if (image !== undefined) return image;

        // load image
        image = await loadImage(path);

        // save image in cache
        this.imageCache.set(cacheKey, image);

        return image;
    }
}