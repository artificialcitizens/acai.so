import React, { useContext, useEffect, useState } from 'react';
import EditorDropzone from '../TipTap/components/EditorDropzone';
import { ACDoc, handleCreateDoc } from '../../state';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import TipTap from '../TipTap/TipTap';
// import PDFRenderer from '../PDFRenderer/PdfRender';
// import { pdfjs } from 'react-pdf';
import { db } from '../../../db';

import {
  GlobalStateContext,
  GlobalStateContextValue,
} from '../../context/GlobalStateContext';
import { readFileAsText, slugify } from '../../utils/data-utils';
// import { getPdfText } from '../../utils/pdf-utils';
// import { VectorStoreContext } from '../../context/VectorStoreContext';
import { useLiveQuery } from 'dexie-react-hooks';
// import { toastifyInfo } from '../Toast';
import KnowledgeView from '../KnowledgeView/KnowledgeView';
import { useSelector } from '@xstate/react';

interface MainViewProps {
  domain: 'knowledge' | 'documents' | undefined;
}

const MainView: React.FC<MainViewProps> = ({ domain }) => {
  const navigate = useNavigate();
  // const vectorContext = useContext(VectorStoreContext);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const globalServices: GlobalStateContextValue =
    useContext(GlobalStateContext);

  const { workspaceId, id: activeTabId } = useParams<{
    workspaceId: string;
    id: string;
  }>();

  const knowledgeItems = useLiveQuery(async () => {
    return await db.knowledge
      .where('id')
      .startsWith(activeTabId || '')
      .toArray();
  }, [activeTabId]);

  const file = useLiveQuery(async () => {
    if (!knowledgeItems || !knowledgeItems[0]?.fileId) return;
    return await db.files.get(knowledgeItems?.[0]?.fileId);
  }, [knowledgeItems]);

  useEffect(() => {
    if (!knowledgeItems || !file) return;
    // create a file url from knowledgeITem.file
    const fileUrl = URL.createObjectURL(file.file);
    setFileUrl(fileUrl);
  }, [file, knowledgeItems]);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const page = queryParams.get('page');
  const fileType = queryParams.get('fileType');

  const activeDoc = useSelector(globalServices.appStateService, (state) => {
    if (!workspaceId || !activeTabId) return;
    const docs = state.context.docs;
    if (!docs) return;
    return Object.values(docs).find((doc) => {
      return doc.id === activeTabId;
    });
  });

  const handleFilesDrop = async (file: File) => {
    if (!workspaceId) return;
    const title = file.name.split('.')[0];
    const fileExtension = file.name.split('.').pop();
    if (!fileExtension) return;
    readFileAsText(file, fileExtension).then((content) => {
      handleCreateDoc({ title, content }, workspaceId).then((tab: ACDoc) => {
        globalServices.appStateService.send({
          type: 'ADD_DOC',
          doc: tab,
        });
        setTimeout(() => {
          navigate(`/${workspaceId}/documents/${tab.id}`);
        }, 250);
      });
    });
  };

  // @TODO: create a util to handle this and use to make a upload to knowledge button
  // @TODO: update to save entire pdf with knowledge
  const handlePdfDrop = async (file: File) => {
    if (!workspaceId) return;
    const fileURL = URL.createObjectURL(file);
    // const pageStartOffset = 0;
    // const pdfDocument = await pdfjs.getDocument(fileURL).promise;
    // const pdfData = await getPdfText(pdfDocument, slugify(file.name));

    // const slugifiedFilename = slugify(file.name);

    // if (vectorContext) {
    //   for (const page of pdfData[slugifiedFilename]) {
    //     const metadata = {
    //       id: `${slugifiedFilename}-page-${page.page}`,
    //       workspaceId,
    //       pageNumber: page.page,
    //       offset: pageStartOffset,
    //       src: `/${workspaceId}/knowledge/${slugifiedFilename}?fileType=pdf&page=1`,
    //       totalPages: pdfData[slugifiedFilename].length,
    //       originalFilename: file.name,
    //     };

    //     const memoryVectors = await vectorContext.addText(
    //       page.content,
    //       [metadata],
    //       `DOCUMENT NAME: ${file.name}\n\nPAGE NUMBER: ${
    //         page.page + pageStartOffset
    //       }\n\n---\n\n`,
    //     );

    //     const filteredMemoryVectors = memoryVectors?.filter(
    //       (item) => item.metadata.id === metadata.id,
    //     );

    //     await db.knowledge.add({
    //       id: metadata.id,
    //       workspaceId,
    //       file,
    //       fullText: page.content,
    //       createdAt: new Date().toISOString(),
    //       lastModified: new Date().toISOString(),
    //       fileType: 'pdf',
    //       memoryVectors: filteredMemoryVectors || [],
    //     });
    //   }
    //   navigate(
    //     `/${workspaceId}/knowledge/${slugify(file.name)}?fileType=pdf&page=1`,
    //   );
    // setFileUrl(fileURL);
    // }
    navigate(
      `/${workspaceId}/knowledge/${slugify(file.name)}?fileType=pdf&page=1`,
    );
    setFileUrl(fileURL);
  };

  if (!workspaceId) return <></>;

  return (
    <div className="w-full flex flex-col mt-16 md:mt-8 max-h-full">
      {/* editor dropzone was overriding the tiptap editor drop callbacks.
      we want to be able to drop images into the editor (we may just need to handle if the file hovering over the editor is an image and then ignore the drop if it is)
      */}
      {/* <EditorDropzone
        workspaceId={workspaceId}
        onPDFDrop={handlePdfDrop}
        showHelperText={false}
        onFilesDrop={handleFilesDrop}
      > */}
      {domain === 'documents' && activeDoc && <TipTap tab={activeDoc} />}
      {domain === 'knowledge' && fileType && (
        <KnowledgeView
          workspaceId={workspaceId}
          filename={activeTabId || 'knowledge'}
          fileType={fileType as 'pdf' | 'txt' | 'md'}
          fileUrl={fileUrl?.toString()}
          content={knowledgeItems?.[0]?.fullText}
          page={page || '1'}
        />
      )}
      {/* </EditorDropzone> */}
    </div>
  );
};

export default MainView;
