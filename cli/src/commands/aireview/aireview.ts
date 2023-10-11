import { black, bgCyan, green, red } from "kolorist";
import { intro, outro, spinner } from "@clack/prompts";
import { assertGitRepo, getGitDiff, getGitShow } from "../../utils/git";
import { archiveDirectoryAsZip, removeDirectory } from "../../utils/file";
import { KnownError, handleCliError } from "../../utils/error";
import path from "path";
import { DiffFiles } from "../../types/aireview";
import { promises as fs } from "fs";

const ZIP_FILE_NAME = "diff.zip";
const DIFF_FILES_DIR = "git-diff-files";

export const aireview = async (output: boolean) => {
  try {
    const cwdDiffFilesDir = path.join(process.cwd(), DIFF_FILES_DIR);

    intro(bgCyan(black(" aireview ")));
    await assertGitRepo();

    await checkExistStagedFiles();

    const resultMessage = await processGitDiffFiles();
    const extractionStatus = await handleDiffFiles(cwdDiffFilesDir, output);

    if (!resultMessage || !extractionStatus) throw new Error("Process failed!");

    outro(`${green("✔")} File output succeeded!`);
  } catch (error) {
    outro(`${red("✖")} ${error.message}`);
    handleCliError(error);
    process.exit(1);
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
    const outputGitDiff = await getGitDiff({ staged: true, nameOnly: true });
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
  cwdDiffFilesDir: string,
  remainDiffFiles: boolean
): Promise<ProcessResult> => {
  const extractingFiles = spinner();
  extractingFiles.start("Creating Diff Files...");

  try {
    await removeDirectory(cwdDiffFilesDir);
    await removeDirectory(ZIP_FILE_NAME);
    await outputGitDiffsByDirectory(DIFF_FILES_DIR);
    await archiveDirectoryAsZip(DIFF_FILES_DIR, ZIP_FILE_NAME);
    if (!remainDiffFiles) {
      await removeDirectory(cwdDiffFilesDir);
    }

    return PROCESS_RESULT.Success;
  } catch (err) {
    console.error("Error occurred while handling diff file", err);
    throw err;
  } finally {
    extractingFiles.stop();
  }
};

const checkExistStagedFiles = async () => {
  const checkStagedFiles = spinner();
  checkStagedFiles.start("Checking Staged Files...");

  try {
    const outputGitDiff = await getGitDiff({ staged: true, nameOnly: true });
    const diffFiles = outputGitDiff.split("\n").filter(Boolean);

    if (diffFiles.length === 0) {
      checkStagedFiles.stop("No staged files found!");
      throw new KnownError(
        "No staged files found! Please check your staged files."
      );
    }

    checkStagedFiles.stop(
      `Staged files:\n${diffFiles.map((file) => `     ${file}`).join("\n")}`
    );

    return PROCESS_RESULT.Success;
  } catch (error) {
    throw new KnownError(error.message);
  }
};

const outputGitDiffsByDirectory = async (
  outputDirectory: string
): Promise<void> => {
  try {
    const diffOutput = await getGitDiff({ staged: true });
    const diffFiles = getDiffFiles(diffOutput);

    await makeDiffFilesDirectory(outputDirectory, diffFiles);

    await saveOriginalFiles(outputDirectory, diffFiles);

    await saveDiffOutput(outputDirectory, diffFiles, diffOutput);
  } catch (error) {
    console.error("Failed to get git diff(outputGitDiffsByDirectory)", error);
    throw error;
  }
};

const getDiffFiles = (diffOutput: string): DiffFiles => {
  return diffOutput
    .split("\n")
    .filter((line) => line.startsWith("diff --git"))
    .map((line) => {
      const path = line.split(" ")[2].split("a/")[1];
      const name = path.split("/").pop() as string;
      return {
        path,
        name,
        content: "",
      };
    });
};

const makeDiffFilesDirectory = async (
  outputDirectory: string,
  diffFiles: DiffFiles
) => {
  const filePath = path.join(process.cwd(), outputDirectory);

  try {
    await Promise.all(
      diffFiles
        .map((file) => path.join(filePath, file.name.split(".")[0]))
        .map((dirPath) => fs.mkdir(dirPath, { recursive: true }))
    );
  } catch (error) {
    console.error(`Failed to make directory at ${filePath}`, error);
    throw error;
  }
};

const saveOriginalFiles = async (
  outputDirectory: string,
  diffFiles: DiffFiles
): Promise<void> => {
  try {
    await Promise.all(
      diffFiles.map(async ({ path: filePath, name: fileName }) => {
        const fileContent = await getGitShow(filePath);
        await fs.writeFile(
          path.join(
            process.cwd(),
            outputDirectory,
            fileName.split(".")[0],
            fileName
          ),
          fileContent
        );
      })
    );
  } catch (error) {
    console.error(`Failed to write file(saveOriginalFiles)`, error);
    throw error;
  }
};

const saveDiffOutput = async (
  outputDirectory: string,
  diffFiles: DiffFiles,
  diffOutput: string
): Promise<void> => {
  const separateDiffs = separateDiffFiles(diffFiles, diffOutput);

  try {
    await Promise.all(
      separateDiffs.map(async ({ name: fileName, content }) => {
        await fs.writeFile(
          path.join(
            process.cwd(),
            outputDirectory,
            fileName.split(".")[0],
            fileName.replace(/\.[^\.]+$/, ".diff")
          ),
          content
        );
      })
    );
  } catch (error) {
    console.error(`Failed to write file(saveDiffOutput)`, error);
    throw error;
  }
};

const separateDiffFiles = (
  diffFiles: DiffFiles,
  diffOutput: string
): DiffFiles => {
  return diffFiles.map((file) => {
    const splitPattern = `diff --git a/${file.path} b/${file.path}`;
    const parts = diffOutput.split(splitPattern);
    const diffFile = parts[1] || "";

    return {
      path: file.path,
      name: file.name,
      content: splitPattern + diffFile,
    };
  });
};
