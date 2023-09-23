import { execa } from "execa";
import { KnownError } from "./error.js";
import { promises as fs } from "fs";

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
