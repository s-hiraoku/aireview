import { black, bgCyan, green, red } from "kolorist";
import { intro, outro, spinner } from "@clack/prompts";
import {
  assertGitRepo,
  getCheckGitDiffFilesMessage,
  getGitDiff,
} from "../utils/git";
import {
  archiveDirectoryAsZip,
  outputGitDiffsByDirectory,
  removeDirectory,
} from "../utils/file";
import { KnownError } from "../utils/error";
import path from "path";

const ZIP_FILE_NAME = "diff.zip";
const DIFF_FILES_DIR = "git-diff-files";

export const aireview = async () => {
  try {
    const cwdDiffFilesDir = path.join(process.cwd(), DIFF_FILES_DIR);

    intro(bgCyan(black(" aireview ")));
    await assertGitRepo();

    const resultMessage = await processGitDiffFiles();
    const extractionStatus = await handleDiffFiles(cwdDiffFilesDir);

    if (!resultMessage || !extractionStatus) throw new Error("Process failed!");

    outro(`${green("✔")} File output succeeded!`);
  } catch (error) {
    outro(`${red("✖")} ${error.message}`);
    console.error("Error occurred in aireview function", error);
    throw error;
  }
};

type ProcessResult = "Success" | "Failed";
const PROCESS_RESULT: Record<ProcessResult, ProcessResult> = {
  Success: "Success",
  Failed: "Failed",
};

const processGitDiffFiles = async (): Promise<ProcessResult> => {
  const checkGitDiffFiles = spinner();
  checkGitDiffFiles.start("Checking Git Diff Files...");

  try {
    const outputGitDiff = await getGitDiff({ nameOnly: true });
    const diffFiles = outputGitDiff.split("\n").filter(Boolean);

    if (diffFiles.length === 0) {
      checkGitDiffFiles.stop("No diff files found!");
      throw new Error("No diff files found! Please check your diff files.");
    }

    checkGitDiffFiles.stop(
      `Git diff files:\n${diffFiles.map((file) => `     ${file}`).join("\n")}`
    );

    return PROCESS_RESULT.Success;
  } catch (error) {
    outro(`${red("✖")} ${error.message}`);
    console.error("Error occurred while checking diff files", error);
    throw error;
  }
};

const handleDiffFiles = async (
  cwdDiffFilesDir: string
): Promise<ProcessResult> => {
  const extractingFiles = spinner();
  extractingFiles.start("Creating Diff Files...");

  try {
    await removeDirectory(cwdDiffFilesDir);
    await outputGitDiffsByDirectory(DIFF_FILES_DIR);
    await archiveDirectoryAsZip(DIFF_FILES_DIR, ZIP_FILE_NAME);
    await removeDirectory(cwdDiffFilesDir);

    return PROCESS_RESULT.Success;
  } catch (err) {
    console.error("Error occurred while handling diff file", err);
    throw err;
  } finally {
    extractingFiles.stop();
  }
};
