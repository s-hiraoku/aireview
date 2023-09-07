import { cli } from "cleye";
import { version, description } from "../package.json";
import { aireview } from "./commands/aireview";

const rawArgv = process.argv.slice(2);

cli(
  {
    name: "aireview",
    version,
    help: {
      description,
    },
  },
  (argv) => {
    aireview();
  },
  rawArgv
);
