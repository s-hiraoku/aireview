import { black, bgCyan } from "kolorist";
import { intro, spinner } from "@clack/prompts";
import { assertGitRepo } from "../utils/git";
import { outputDiffFile, saveGitDiffToFile } from "../utils/file";
import { promises as fs } from "fs";

export const aireview = async () => {
  try {
    intro(bgCyan(black(" aireview ")));
    await assertGitRepo();

    const extractingFiles = spinner();
    extractingFiles.start("Creating Diff Files...");

    try {
      const diffFilePath = await saveGitDiffToFile();
      await outputDiffFile(diffFilePath);
      await fs.unlink(diffFilePath);
    } catch (err) {
      console.error("Error occurred while handling diff file", err);
      throw err;
    } finally {
      extractingFiles.stop();
    }
  } catch (err) {
    console.error("Error occurred in aireview function", err);
    throw err;
  }
};