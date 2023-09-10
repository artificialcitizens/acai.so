import React, { useContext } from 'react';
import { Tab } from '../../state';

import { VectorStoreContext } from '../../context/VectorStoreContext';
import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import { useNavigate } from 'react-router-dom';
import SBSearch from '../Search';
import StorageMeter from '../StorageMeter/StorageMeter';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../db';
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
            createdAt: new Date().toString(),
            lastUpdated: new Date().toString(),
            filetype: 'markdown',
            systemNote: '',
          };
          appStateService.send({ type: 'ADD_TAB', tab: newTab });
          navigate(`/${workspaceId}/${newTab.id}`);
        }}
      />
      {knowledgeItems && knowledgeItems.length > 0 && (
        <ul className="bg-base rounded-lg p-3 max-h-[50vh] overflow-scroll">
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
      {/* <StorageMeter /> */}
    </div>
  );
};

export default Knowledge;
