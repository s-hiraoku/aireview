import { execa } from 'execa';
import { KnownError } from './error.js';
import { promises as fs } from 'fs';

export const archiveDirectoryAsZip = async (sourceDirectory: string, outputZip: string) => {
  try {
    const { stdout } = await execa('zip', ['-r', outputZip, sourceDirectory]);
    return stdout;
  } catch (error) {
    throw new KnownError('Failed to make zip file!');
  }
};

export const removeDirectory = async (dirPath: string, recursive: boolean = true, ignoreIfAbsent: boolean = true) => {
  try {
    await fs.access(dirPath);

    await fs.rm(dirPath, { recursive });
  } catch (error) {
    if (error.code === 'ENOENT' && ignoreIfAbsent) {
      return;
    }
    console.error(`Failed to remove directory at ${dirPath}`, error);
    throw error;
  }
};

export const isFileAbsentOrDirectoryEmpty = async (dirPath: string, fileName?: string): Promise<boolean> => {
  try {
    const files = await fs.readdir(dirPath);
    return fileName ? !files.includes(fileName) : files.length === 0;
  } catch (error) {
    console.error(`Failed to read directory at ${dirPath}`, error);
    throw error;
  }
};

export const findAvailableDirectory = async (baseDir: string, fileName?: string): Promise<string> => {
  if (await isFileAbsentOrDirectoryEmpty(baseDir, fileName)) {
    return baseDir;
  }

  let index = 1;
  while (true) {
    const dirName = `${baseDir}__${index}`;
    const isEmpty = await isFileAbsentOrDirectoryEmpty(dirName, fileName);

    if (isEmpty) {
      return dirName;
    }

    index++;
  }
};
