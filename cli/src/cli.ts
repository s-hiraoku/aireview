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
      version: {
        type: String,
        alias: "v",
        description: "Show version",
        default: false,
      },
    },
    help: {
      description,
    },
  },
  (argv) => {
    console.log(argv);
    if (argv.flags.version) {
      return console.log(version);
    }
    aireview(argv.flags.output);
  },
  rawArgv
);
