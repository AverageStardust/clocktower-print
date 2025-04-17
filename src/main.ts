import { promptConfig } from "./config.ts";
import "./render.ts";

async function main() {
    const config = promptConfig();
    console.log(await config);
}

main();