import React, { useContext } from 'react';
import EditorDropzone from '../TipTap/components/EditorDropzone';
import { Tab, handleCreateTab } from '../../state';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import TipTap from '../TipTap/TipTap';
import PDFRenderer from '../PDFRenderer/PdfRender';
import { pdfjs } from 'react-pdf';
import { db } from '../../../db';

import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import { readFileAsText, slugify } from '../../utils/data-utils';
import { getPdfText } from '../../utils/pdf-utils';
import { VectorStoreContext } from '../../context/VectorStoreContext';

interface MainViewProps {
  domain: 'knowledge' | 'documents' | undefined;
}

const MainView: React.FC<MainViewProps> = ({ domain }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vectorContext = useContext(VectorStoreContext);
  const [fileUrl, setFileUrl] = React.useState<string | null>(null);

  const fileType = queryParams.get('fileType');

  const globalServices: GlobalStateContextValue =
    useContext(GlobalStateContext);

  const { workspaceId, id: activeTabId } = useParams<{
    workspaceId: string;
    id: string;
  }>();

  const workspace =
    globalServices.appStateService.getSnapshot().context.workspaces[
      workspaceId || 'docs'
    ];

  const activeTab: Tab =
    workspace &&
    workspace.data.tiptap.tabs.find((tab: Tab) => tab.id === activeTabId);

  const handleDeleteWorkspace = () => {
    const confirmDelete = window.prompt(
      `Please type the name of the workspace to confirm deletion: ${workspace?.name}`,
    );
    if (confirmDelete !== workspace?.name) {
      alert('Workspace name does not match. Deletion cancelled.');
      return;
    }
    globalServices.appStateService.send({
      type: 'DELETE_WORKSPACE',
      id: workspace?.id,
    });
    globalServices.agentStateService.send({
      type: 'DELETE_AGENT',
      workspaceId: workspace?.id,
    });
    setTimeout(() => {
      navigate('/');
    }, 250);
  };

  const handleFilesDrop = async (file: File) => {
    if (!workspaceId) return;
    const title = file.name.split('.')[0];
    const fileExtension = file.name.split('.').pop();
    if (!fileExtension) return;
    readFileAsText(file, fileExtension).then((content) => {
      handleCreateTab({ title, content }, workspaceId).then((tab: Tab) => {
        globalServices.appStateService.send({
          type: 'ADD_TAB',
          tab,
        });
        setTimeout(() => {
          navigate(`/${workspaceId}/documents/${tab.id}`);
        }, 250);
      });
    });
  };

  const handlePdfDrop = async (file: File) => {
    if (!workspaceId) return;
    const pageStartOffset = 0;
    const fileURL = URL.createObjectURL(file);
    const pdfDocument = await pdfjs.getDocument(fileURL).promise;
    const pdfData = await getPdfText(pdfDocument, slugify(file.name));

    const slugifiedFilename = slugify(file.name);

    if (vectorContext) {
      for (const page of pdfData[slugifiedFilename]) {
        const metadata = {
          id: `${slugifiedFilename}-page-${page.page}`,
          workspaceId,
          pageNumber: page.page,
          offset: pageStartOffset,
          filetype: 'pdf',
          file,
          src: `/${workspaceId}/knowledge/${slugifiedFilename}/${page.page}`,
          totalPages: pdfData[slugifiedFilename].length,
          originalFilename: file.name,
        };

        // const memoryVectors = await vectorContext.addText(
        //   page.content,
        //   [metadata],
        //   `DOCUMENT NAME: ${file.name}\n\nPAGE NUMBER: ${
        //     page.page + pageStartOffset
        //   }\n\n---\n\n`,
        // );

        // const filteredMemoryVectors = memoryVectors?.filter(
        //   (item) => item.metadata.id === metadata.id,
        // );

        await db.knowledge.add({
          id: metadata.id,
          workspaceId,
          file,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          memoryVectors: [],
        });
      }
      navigate(
        `/${workspaceId}/knowledge/${slugify(file.name)}?fileType=pdf&page=1`,
      );
      setFileUrl(fileURL);
    }
  };

  console.log(domain, fileUrl, activeTabId);
  return !workspaceId ? (
    <p>Loading</p>
  ) : (
    <div className="w-full flex flex-col h-screen">
      <div className="ml-16 flex items-center group">
        {workspace && <h1 className="m-2 text-lg">{workspace.name}</h1>}
        {workspaceId !== 'docs' && (
          <button
            className="p-0 px-1  rounded-full font-medium text-red-900 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-4"
            onClick={handleDeleteWorkspace}
          >
            x
          </button>
        )}
      </div>
      <div className="max-h-[calc(100vh-2rem)] flex flex-grow overflow-scroll">
        <EditorDropzone
          workspaceId={workspaceId}
          onPDFDrop={handlePdfDrop}
          showHelperText={!activeTabId && !fileUrl}
          onFilesDrop={handleFilesDrop}
        >
          {domain === 'documents' && activeTab && <TipTap tab={activeTab} />}
          {domain === 'knowledge' && activeTabId && (
            <PDFRenderer id={activeTabId} startingPage={1} />
          )}
        </EditorDropzone>
      </div>
    </div>
  );
};

export default MainView;
