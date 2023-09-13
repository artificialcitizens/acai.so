import React, { useContext } from 'react';
import { Tab } from '../../state';

import { VectorStoreContext } from '../../context/VectorStoreContext';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import { useNavigate } from 'react-router-dom';
import SBSearch from '../Search';
// import StorageMeter from '../StorageMeter/StorageMeter';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db';
import { toastifyError, toastifyInfo } from '../Toast';
import { readFileAsText, slugify } from '../../utils/data-utils';
import Dropzone from '../Dropzone/Dropzone';
interface KnowledgeProps {
  workspaceId: string;
}

const Knowledge: React.FC<KnowledgeProps> = ({ workspaceId }) => {
  const { appStateService }: GlobalStateContextValue =
    useContext(GlobalStateContext);
  const vectorContext = useContext(VectorStoreContext);
  const navigate = useNavigate();

  const knowledgeItems = useLiveQuery(async () => {
    if (!vectorContext) return;
    return await db.memoryVectors
      .where('workspaceId')
      .equals(workspaceId)
      .toArray();
  }, [workspaceId]);

  // @TODO: Move logic to Dropzone component
  const handleFileDrop = async (files: File[], name: string) => {
    if (!import.meta.env.DEV) return;

    for (const file of files) {
      if (!file) return;

      const fileExtension = file.name.split('.').pop();
      switch (fileExtension) {
        case 'txt':
        case 'md':
          {
            try {
              toastifyInfo(`📁 Processing ${file.name}`);
              const fileContent = await readFileAsText(file);
              const slugifiedFilename = slugify(file.name);
              if (vectorContext) {
                // need to figure out how to pass metadata to filter by
                // @TODO: need to figure this out so we can filter the vectors based on the slugifiedFilename and workspaceId
                // to prevent duplicates
                const memoryVectors = await vectorContext.addText(fileContent);
                //@TODO: add a check to see if the file already exists
                const id = db.memoryVectors.add({
                  id: slugifiedFilename,
                  workspaceId,
                  memoryVectors: memoryVectors || [],
                });
              } else {
                throw new Error('Context is null');
              }
              toastifyInfo(`File uploaded successfully: ${file.name}`);
            } catch (error) {
              toastifyError(`Error processing file: ${file.name}`);
            }
          }
          break;
        case 'pdf': {
          try {
            toastifyInfo(`📁 Processing ${file.name}`);
            const fileContent = await readFileAsText(file);
            const slugifiedFilename = slugify(file.name);
            if (vectorContext) {
              console.log(fileContent);
              // // need to figure out how to pass metadata to filter by
              // const memoryVectors = await context.addText(fileContent);
              // const id = db.memoryVectors.add({
              //   id: slugifiedFilename,
              //   workspaceId,
              //   memoryVectors: memoryVectors || [],
              // });
              // toastifyInfo(`File uploaded successfully: ${file.name}`);
            } else {
              throw new Error('Context is null');
            }
          } catch (error) {
            toastifyError(`Error processing file: ${file.name}`);
          }
          break;
        }
        default:
          toastifyError(`Please upload a .txt or .md file`);
          break;
      }
    }
  };

  return (
    <div className="flex flex-col">
      <SBSearch
        onSubmit={async (val: string) => {
          if (!vectorContext) return;
          const response = await vectorContext.similaritySearchWithScore(val);
          const results = vectorContext.filterAndCombineContent(response, 0.6);
          const newTab: Tab = {
            id: Date.now().toString(),
            title: val,
            content: results,
            workspaceId,
            isContext: false,
            autoSave: false,
            createdAt: new Date().toString(),
            lastUpdated: new Date().toString(),
            filetype: 'markdown',
            systemNote: '',
          };
          appStateService.send({ type: 'ADD_TAB', tab: newTab });
          navigate(`/${workspaceId}/${newTab.id}`);
        }}
      />
      <Dropzone onFilesDrop={handleFileDrop}>
        {knowledgeItems?.length === 0 && (
          <div className="w-full h-20 bg-base rounded-lg mb-4">
            <div
              className={`w-full h-full flex flex-col justify-center items-center`}
            >
              <div className="text-4xl text-acai-white">
                <i className="fas fa-file-upload"></i>
              </div>
              <div className="text-acai-white">Drop a file to upload</div>
            </div>
          </div>
        )}
        {knowledgeItems && knowledgeItems.length > 0 && (
          <ul className="bg-base rounded-lg p-3 max-h-[50vh] w-full overflow-scroll">
            {knowledgeItems?.map((item) => (
              <li
                key={item.id}
                className="text-acai-white text-xs font-semibold mb-3 flex justify-between"
              >
                {/* convert example-txt  to example.txt */}
                {item.id.replace(/-(\w+)$/, '.$1')}
                <button
                  className="p-0 px-1  rounded-full font-medium text-red-900"
                  onClick={async () => {
                    const confirmDelete = window.prompt(
                      `Please type the name of the piece knowledge to confirm deletion: ${item.id}`,
                    );
                    if (confirmDelete !== item.id) {
                      alert('Name does not match. Deletion cancelled.');
                      return;
                    }
                    await db.memoryVectors.delete(item.id);
                  }}
                >
                  x
                </button>
              </li>
            ))}
          </ul>
        )}
      </Dropzone>
      {/* <StorageMeter /> */}
    </div>
  );
};

export default Knowledge;
// const handleFileDrop = async (files: File[], name: string) => {
//   const conversations: { [key: string]: any } = {};

//   for (const file of files) {
//     if (!file) return;
//     console.log(file);
//     toast(`📁 Processing ${file.name}`, {
//       toastId: `${file.name}`,
//       className: 'custom-toast',
//       position: 'top-right',
//       autoClose: false,
//       hideProgressBar: false,
//       closeOnClick: true,
//       pauseOnHover: true,
//       draggable: true,
//       theme: 'dark',
//     });

//     const fileExtension = file.name.split('.').pop();
//     const reader = new FileReader();

//     switch (fileExtension) {
//       case 'jpg':
//       case 'jpeg':
//       case 'png':
//         reader.onload = () => {
//           toast.update(`${file.name}`, {
//             render: 'Image uploaded successfully',
//             type: 'success',
//             autoClose: 5000,
//           });
//         };
//         reader.readAsDataURL(file);
//         break;
//       default:
//         try {
//           const fileContent = await readFileAsText(file);

//           const conversation = convertDSPTranscript(fileContent);

//           const slugifiedFilename = slugify(file.name);
//           conversations[slugifiedFilename] = conversation;

//           toast.update(`${file.name}`, {
//             render: 'File uploaded successfully',
//             type: 'success',
//             autoClose: 5000,
//           });
//         } catch (error) {
//           console.error('Error processing file:', file, error);
//           toast.update(`${file.name}`, {
//             render: 'Error processing file',
//             type: 'error',
//             autoClose: 5000,
//           });
//         }
//     }
//   }

//   // Save as JSON file
//   const jsonContent = JSON.stringify(conversations, null, 2);
//   const jsonFile = new Blob([jsonContent], { type: 'application/json' });
//   const jsonDownloadLink = document.createElement('a');
//   jsonDownloadLink.href = URL.createObjectURL(jsonFile);
//   jsonDownloadLink.download = `${name}.json`;
//   jsonDownloadLink.click();

//   // Convert JSON to YAML
//   const yamlContent = yaml.dump(conversations);

//   // Save as YAML file
//   const yamlFile = new Blob([yamlContent], { type: 'application/x-yaml' });
//   const yamlDownloadLink = document.createElement('a');
//   yamlDownloadLink.href = URL.createObjectURL(yamlFile);
//   yamlDownloadLink.download = `${name}.yml`;
//   yamlDownloadLink.click();
// };
