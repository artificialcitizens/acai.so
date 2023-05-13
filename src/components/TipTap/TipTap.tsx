import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React from 'react';

interface MenuBarProps {
  editor: Editor | null;
  onClickHandler: (message: string) => Promise<string>;
  label: string;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor, onClickHandler, label }) => {
  if (!editor) {
    return null;
  }

  return (
    <>
      <button
        onClick={async () => {
          const text = editor.getText();
          const response = await onClickHandler(text);
          editor.commands.setContent(response);
        }}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        {label}
      </button>
    </>
  );
};
interface TipTapProps {
  startingValue?: string;
  onClickHandler: (message: string) => Promise<string>;
  label: string;
}

const TipTap: React.FC<TipTapProps> = ({ startingValue, onClickHandler, label }) => {
  const editor = useEditor({
    extensions: [
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
      TextStyle.configure({ types: [ListItem.name] }),
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
    ],
    content: startingValue,
  });

  return (
    <div>
      <MenuBar onClickHandler={onClickHandler} editor={editor} label={label} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TipTap;
