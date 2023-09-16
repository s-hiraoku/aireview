import { black, bgCyan, green, red } from "kolorist";
import { intro, outro, spinner } from "@clack/prompts";
import {
  assertGitRepo,
  getCheckGitDiffFilesMessage,
  getGitDiffFiles,
} from "../utils/git";
import { outputDiffFile, saveGitDiffToFile } from "../utils/file";
import { promises as fs } from "fs";
import { KnownError } from "../utils/error";

export const aireview = async () => {
  try {
    intro(bgCyan(black(" aireview ")));
    await assertGitRepo();

    const checkGitDiffFiles = spinner();
    checkGitDiffFiles.start("Checking Git Diff Files...");

    try {
      const diffFiles = await getGitDiffFiles();

      if (diffFiles.length === 0) {
        checkGitDiffFiles.stop("No diff files found!");
        throw new KnownError(
          "No diff files found! Please check your diff files."
        );
      }

      checkGitDiffFiles.stop(
        `${getCheckGitDiffFilesMessage(diffFiles)}:\n${diffFiles
          .map((file) => `     ${file}`)
          .join("\n")}`
      );
    } catch (error) {
      outro(`${red("✖")} ${error.message}`);
      console.error("Error occurred while checking diff files", error);
      throw error;
    }

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
    outro(`${green("✔")} File output succeeded!`);
  } catch (error) {
    outro(`${red("✖")} ${error.message}`);
    console.error("Error occurred in aireview function", error);
    throw error;
  }
};
