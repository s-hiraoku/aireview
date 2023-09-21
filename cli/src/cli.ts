import { cli } from "cleye";
import { version, description } from "../package.json";
import { aireview } from "./commands/aireview";

const rawArgv = process.argv.slice(2);

cli(
  {
    name: "aireview",
    version,
    flags: {
      output: {
        type: Boolean,
        alias: "o",
        description: "Output Files before compression",
        default: false,
      },
    },
    help: {
      description,
    },
  },
  (argv) => {
    aireview(argv.flags.output);
  },
  rawArgv
);
