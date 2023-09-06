import { cli } from "cleye";
import { version, description } from "../package.json";

cli({
  name: "aireview",
  version,
  help: {
    description,
  },
});

console.log("Hello, cleye!");
