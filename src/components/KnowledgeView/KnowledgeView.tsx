import React, { useMemo } from 'react';
import PDFRenderer from '../PDFRenderer/PdfRender';
import Tiptap from '../TipTap/TipTap';
import { v4 as uuidv4 } from 'uuid';

interface KnowledgeViewProps {
  workspaceId: string;
  filename: string;
  fileType: 'pdf' | 'txt' | 'md';
  fileUrl?: string;
  content?: string;
  page?: string;
}

const knowledgeTab = (workspaceId: string, title: string, content: string) => {
  return {
    id: uuidv4().split('-')[0],
    workspaceId,
    title,
    filetype: 'md',
    content,
    isContext: false,
    systemNote: '',
    createdAt: new Date().toString(),
    lastUpdated: new Date().toString(),
    autoSave: false,
    canEdit: false,
  };
};

const KnowledgeView: React.FC<KnowledgeViewProps> = ({
  workspaceId,
  filename,
  fileType,
  fileUrl,
  content,
  page,
}) => {
  const tab = useMemo(
    () => knowledgeTab(workspaceId, filename, content || ''),
    [workspaceId, filename, content],
  );
  const renderKnowledgeView = () => {
    switch (fileType) {
      case 'pdf':
        if (!fileUrl) return <div>no fileUrl</div>;
        return (
          <PDFRenderer startingPage={Number(page) || 1} fileUrl={fileUrl} />
        );
      case 'txt':
      case 'md':
        if (!content) return <div>no content</div>;
        return <Tiptap tab={tab} />;
      default:
        return <div>Not sure how you got here...</div>;
    }
  };

  return <div>{renderKnowledgeView()}</div>;
};

export default KnowledgeView;
