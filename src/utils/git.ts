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
    throw new Error(`Failed to get git diff: ${error.message}`);
  }
};
