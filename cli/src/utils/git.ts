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

type GetDiFFOptions = {
  staged?: boolean;
  branch?: string;
  nameOnly?: boolean;
};

const defaultGetGitDiff: GetDiFFOptions = {
  staged: false,
  branch: "",
  nameOnly: false,
};
export const getGitDiff = async ({
  staged = false,
  branch = "",
  nameOnly = false,
}: GetDiFFOptions = defaultGetGitDiff): Promise<string> => {
  const args = ["diff"];

  if (staged) {
    args.push("--staged");
  }

  if (branch !== "") {
    args.push(branch);
  }

  if (nameOnly) {
    args.push("--name-only");
  }

  try {
    const { stdout } = await execa("git", args);
    return stdout;
  } catch (error) {
    throw new Error(`Failed to get git diff(getGitDiff): ${error.message}`);
  }
};

export const getCheckGitDiffFilesMessage = (files: string[]) =>
  `Detected ${files.length.toLocaleString()} change file${
    files.length > 1 ? "s" : ""
  }`;
