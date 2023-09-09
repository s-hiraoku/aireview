import { execa } from "execa";
import { KnownError } from "./error.js";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { getGitDiff } from "./git.js";

export const outputDiffFile = async (diffFile: string) => {
  try {
    const { stdout } = await execa("zip", ["-r", "diff.zip", diffFile]);
    return stdout;
  } catch (error) {
    throw new KnownError("Failed to make zip file!");
  }
};

export const saveGitDiffToFile = async (): Promise<string> => {
  try {
    const diffOutput = await getGitDiff();
    const tmpFilePath = path.join(os.tmpdir(), "git-diff-output.txt");

    try {
      await fs.writeFile(tmpFilePath, diffOutput);
      return tmpFilePath;
    } catch (error) {
      console.error(`Failed to write file at ${tmpFilePath}`, error);
      throw error;
    }
  } catch (error) {
    console.error("Failed to get git diff", error);
    throw error;
  }
};
