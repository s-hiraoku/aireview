import { cli } from "cleye";
import { version, description } from "../package.json";
import { aireview } from "./commands/aireview";

const rawArgv = process.argv.slice(2);

cli(
  {
    name: "aireview",
    version,
    flags: {
      all: {
        type: Boolean,
        description:
          "Automatically stage changes in tracked files for the commit",
        alias: "a",
        default: false,
      },
    },
    help: {
      description,
    },
  },
  (argv) => {
    aireview(argv.flags.all);
  },
  rawArgv
);
