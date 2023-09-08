import { execa } from "execa";
import { black, dim, green, red, bgCyan } from "kolorist";
import {
  intro,
  outro,
  spinner,
  select,
  confirm,
  isCancel,
} from "@clack/prompts";

export const aireview = async () => {
  intro(bgCyan(black(" aireview ")));

  const detectingFiles = spinner();
};
