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
import { assertGitRepo } from "../utils/git";

export const aireview = async () => {
  intro(bgCyan(black(" aireview ")));
  await assertGitRepo();

  const extractingFiles = spinner();

  extractingFiles.start("Detecting staged files");
};
