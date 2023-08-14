import React from 'react';
import { Editor } from '@tiptap/react';

export const EditorContext = React.createContext<{
  editor: Editor | null;
  setEditor: React.Dispatch<React.SetStateAction<Editor | null>>;
} | null>(null);
