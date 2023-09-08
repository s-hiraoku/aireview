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

export const aireview = async (stageAll: boolean) => {
  intro(bgCyan(black(" aireview ")));

  const detectingFiles = spinner();

  if (stageAll) {
    await execa("git", ["add", "--update"]);
  }
};
