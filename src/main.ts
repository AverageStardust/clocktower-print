import { promptConfig } from "./config.ts";
import { HexRenderer } from "./render.ts";

async function main() {
    console.log("Clocktower Print v0.1\n");

    const config = await promptConfig();
    const renderer = new HexRenderer();
    renderer.renderConfig(config);
}

main();