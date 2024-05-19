import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const generateFileSystemTree = (
  directoryPath,
  ignoreList = ['node_modules', 'dist', 'build'],
) => {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  return entries.reduce((acc, entry) => {
    if (ignoreList.includes(entry.name)) {
      return acc;
    }

    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      return {
        ...acc,
        [entry.name]: {
          directory: generateFileSystemTree(entryPath, ignoreList),
        },
      };
    } else {
      const fileContents = fs.readFileSync(entryPath, 'utf-8');
      return {
        ...acc,
        [entry.name]: {
          file: {
            contents: fileContents
              .replace(/\\/g, '\\\\')
              .replace(/`/g, '\\`')
              .replace(/\$/g, '\\$'), // Escape backslashes, backticks, and dollar signs
          },
        },
      };
    }
  }, {});
};

// Get the directory path from command line arguments
const directoryPath =
  // eslint-disable-next-line no-undef
  process.argv[2] || '/home/josh/dev/acai.so/src/components/Proto/apps/react';
const files = generateFileSystemTree(directoryPath);

// Get the directory of the current module
const dirname = path.dirname(fileURLToPath(import.meta.url));

// Get the directory name from the directory path
const directoryName = path.basename(directoryPath);

// Write the file system tree to a new file in the current directory
fs.writeFileSync(
  path.join(dirname, `${directoryName}-files.ts`),
  `export const files = ${JSON.stringify(files, null, 2)};`,
);
