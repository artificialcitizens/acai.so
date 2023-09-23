import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// type FileSystemNode = {
//   [name: string]: {
//     directory?: FileSystemNode;
//     file?: {
//       contents: string;
//     };
//   };
// };

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

const files = generateFileSystemTree('src/components/Proto/vite'); // specify the path to the directory

// Get the directory of the current module
const dirname = path.dirname(fileURLToPath(import.meta.url));

// Write the file system tree to a new file in the current directory
fs.writeFileSync(
  path.join(dirname, 'vite/files.ts'),
  `export const files = ${JSON.stringify(files, null, 2)};`,
);
