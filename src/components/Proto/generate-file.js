import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const generateFileSystemTree = (directoryPath) => {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });

  return entries.reduce((acc, entry) => {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      return {
        ...acc,
        [entry.name]: {
          directory: generateFileSystemTree(entryPath),
        },
      };
    } else {
      const fileContents = fs.readFileSync(entryPath, 'utf-8');
      return {
        ...acc,
        [entry.name]: {
          file: {
            contents: fileContents,
          },
        },
      };
    }
  }, {});
};

// Get the directory path from command line arguments
// eslint-disable-next-line no-undef
const directoryPath = process.argv[2] || 'src/components/Proto/apps/vite';

const files = generateFileSystemTree(directoryPath);

// Get the directory of the current module
const dirname = path.dirname(fileURLToPath(import.meta.url));

// Get the directory name from the directory path
const directoryName = path.basename(directoryPath);

// Write the file system tree to a new file in the current directory
fs.writeFileSync(
  // eslint-disable-next-line no-undef
  path.join(dirname, directoryName + '-files.ts'),
  `export const files = ${JSON.stringify(files, null, 2)};`,
);
