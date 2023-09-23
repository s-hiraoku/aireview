import { execa } from "execa";
import { KnownError } from "./error.js";
import { promises as fs } from "fs";
import path from "path";
import { getGitDiff, getGitShow } from "./git.js";

export const archiveDirectoryAsZip = async (
  sourceDirectory: string,
  outputZip: string
) => {
  try {
    const { stdout } = await execa("zip", ["-r", outputZip, sourceDirectory]);
    return stdout;
  } catch (error) {
    throw new KnownError("Failed to make zip file!");
  }
};

export const removeDirectory = async (
  dirPath: string,
  recursive: boolean = true,
  ignoreIfAbsent: boolean = true
) => {
  try {
    await fs.access(dirPath);

    await fs.rm(dirPath, { recursive });
  } catch (error) {
    if (error.code === "ENOENT" && ignoreIfAbsent) {
      return;
    }
    console.error(`Failed to remove directory at ${dirPath}`, error);
    throw error;
  }
};

export const outputGitDiffsByDirectory = async (
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

type DiffFiles = Array<DiffFile>;
type DiffFile = {
  path: string;
  name: string;
  content: string;
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
        console.log(fileName);
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
    const diffFile = diffOutput.split(
      `diff --git a/${file.path} b/${file.path}`
    )[1];

    return { path: file.path, name: file.name, content: diffFile };
  });
};
