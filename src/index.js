import pc from "picocolors";
import { init } from "./commands/init.js";

const HELP = `
${pc.bold("plugnplay")} — one-command backend setup for new projects.

${pc.bold("Usage")}
  plugnplay init        Connect Supabase (or Firebase) to this project
  plugnplay help        Show this help

${pc.bold("Examples")}
  npx plugnplay init
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
    default:
      console.error(pc.red(`Unknown command: ${command}`));
      console.log(HELP);
      process.exit(1);
  }
}
