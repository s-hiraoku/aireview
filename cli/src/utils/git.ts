import { execa } from "execa";
import { KnownError } from "./error.js";

export const assertGitRepo = async (): Promise<string> => {
  let stdout;

  try {
    const result = await execa("git", ["rev-parse", "--show-toplevel"]);
    stdout = result.stdout;
  } catch (error) {
    throw new KnownError("The current directory must be a Git repository!");
  }

  return stdout;
};

export const getGitDiff = async (): Promise<string> => {
  try {
    const { stdout } = await execa("git", ["diff"]);
    return stdout;
  } catch (error) {
    throw new Error(`Failed to get git diff(getGitDiff): ${error.message}`);
  }
};

export const getGitDiffFiles = async (): Promise<string[]> => {
  try {
    const { stdout: files } = await execa("git", ["diff", "--name-only"]);
    if (!files) {
      return [];
    }
    return files.split("\n");
  } catch (error) {
    throw new Error(
      `Failed to get git diff(getGitDiffFiles): ${error.message}`
    );
  }
};
export const getCheckGitDiffFilesMessage = (files: string[]) =>
  `Detected ${files.length.toLocaleString()} change file${
    files.length > 1 ? "s" : ""
  }`;
