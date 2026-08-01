import { createRequire } from "node:module";
import pc from "picocolors";
import { init } from "./commands/init.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

const HELP = `
${pc.bold("plugnplay")} — one-command backend setup for new projects.

${pc.bold("Usage")}
  plugnplay init        Connect Supabase to this project
  plugnplay version     Show the installed version
  plugnplay help        Show this help

${pc.bold("Examples")}
  npx plugnplay-cli init
`;

export async function main() {
  const [command] = process.argv.slice(2);

  switch (command) {
    case undefined:
    case "init":
      await init();
      break;
    case "help":
    case "--help":
    case "-h":
      console.log(HELP);
      break;
    case "version":
    case "--version":
    case "-v":
      console.log(version);
      break;
    default:
      console.error(pc.red(`Unknown command: ${command}`));
      console.log(HELP);
      process.exit(1);
  }
}
