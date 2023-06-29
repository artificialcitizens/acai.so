import { BubbleMenu, Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect, useRef } from 'react';
import './TipTap.css';
import { TextSelection } from '@tiptap/pm/state';
import Highlight from '@tiptap/extension-highlight';
import { marked } from 'marked';

interface MenuBarProps {
  editor: Editor | null;
  onClickHandler: (message: string) => Promise<string>;
  label: string;
}

const runAutocomplete = (editor: Editor) => {
  const text = editor.getText();
  editor.commands.focus();
  const cursorPosition = editor.view.state.selection.from;
  // Insert the text after the cursor position with a background color mark
  const newText = 'hello world';
  const transaction = editor.view.state.tr
    .insertText(newText, cursorPosition)
    .addMark(
      cursorPosition,
      cursorPosition + newText.length,
      editor.view.state.schema.marks.highlight.create({ color: '#777' }),
    );
  editor.view.dispatch(transaction);
  const newPosition = TextSelection.create(editor.view.state.doc, cursorPosition);
  editor.view.dispatch(editor.view.state.tr.setSelection(newPosition));
  // const response = await onClickHandler(text);
  // editor.commands.setContent(response);
};

const onTypingStart = (editor: Editor) => {
  let timer: NodeJS.Timeout;

  function onTyping(event: KeyboardEvent) {
    if (!editor.view.hasFocus()) {
      return;
    }

    clearTimeout(timer);
    timer = setTimeout(() => {
      // Get the current position of the cursor.
      const cursorPosition = editor.view.state.selection.from;
      const text = 'Hello, World!';

      // Insert the text after the cursor position with a background color mark
      const transaction = editor.view.state.tr
        .insertText(text, cursorPosition)
        .addMark(
          cursorPosition,
          cursorPosition + text.length,
          editor.view.state.schema.marks.highlight.create({ color: '#777' }),
        );
      editor.view.dispatch(transaction);
      const newPosition = TextSelection.create(editor.view.state.doc, cursorPosition);
      editor.view.dispatch(editor.view.state.tr.setSelection(newPosition));

      const handleAutocompleteKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          // Remove the highlight mark from the text and move the cursor to the end of the text
          const newText = editor.view.state.doc.textContent;
          editor.commands.setContent(newText);

          editor.chain().focus().unsetHighlight().run();
        } else {
          // Remove the suggested text
          const newText = editor.view.state.doc.textContent.replace(text, '');
          // Check if the pressed key is a valid character
          if (event.key.length === 1 && event.keyCode >= 32 && event.keyCode <= 126) {
            // Add the last keystroke to the editor so the user can continue typing
            editor.commands.setContent(newText + event.key);
          } else {
            // Set the content without adding the pressed key
            editor.commands.setContent(newText);
          }
        }
      };

      function handleMouseDown() {
        // Remove the suggested text
        const newText = editor.view.state.doc.textContent.replace(text, '');
        editor.commands.setContent(newText);

        // Remove the event listeners
        editor.view.dom.removeEventListener('keydown', handleAutocompleteKeyPress);
        editor.view.dom.removeEventListener('mousedown', handleMouseDown);
      }

      // If user presses any key other than enter, then remove the suggestion
      // If user presses enter, then remove the .preview-suggestion span and replace with just the text
      editor.view.dom.addEventListener('keydown', handleAutocompleteKeyPress);

      // If user clicks the mouse, then remove the suggestion
      editor.view.dom.addEventListener('mousedown', handleMouseDown);
    }, 1500);
  }

  function onMouseDown() {
    clearTimeout(timer);
  }

  // Add the 'keyup' event listener
  editor.view.dom.addEventListener('keyup', onTyping);

  // Add the 'mousedown' event listener
  editor.view.dom.addEventListener('mousedown', onMouseDown);

  return function () {
    // Remove the 'keyup' event listener
    editor.view.dom.removeEventListener('keyup', onTyping);

    // Remove the 'mousedown' event listener
    editor.view.dom.removeEventListener('mousedown', onMouseDown);
  };
};

// @todo refresh button
const MenuBar: React.FC<MenuBarProps> = ({ editor, onClickHandler, label }) => {
  const [loading, setLoading] = React.useState(false);
  const [autocomplete, setAutocomplete] = React.useState(false);
  const [messages, setMessages] = React.useState<string[]>([]);

  // useEffect(() => {
  //   if (!editor) return;

  //   const unsubscribe = onTypingStart(editor);
  //   return () => {
  //     unsubscribe();
  //   };
  // }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-menu">
      <button
        onClick={async () => {
          setLoading(true);
          try {
            const text = editor.getText();
            if (!text) {
              return;
            }
            const prompt = `Respond to the following query using basic markdown: 
            query: ${text}}`;
            const query = encodeURIComponent(prompt);
            const response = await fetch(`http://localhost:3000/query?query=${query}`);
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            // console.log(response.body);
            // response.body?.pipeTo(new WritableStream());
            const result = await response.text();
            editor.commands.setContent(result);
          } catch (e) {
            console.log(e);
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        Query
      </button>
      <button
        onClick={async () => {
          runAutocomplete(editor);
        }}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        Autocomplete
      </button>
    </div>
  );
};
interface TipTapProps {
  startingValue?: string;
  onClickHandler: (message: string) => Promise<string>;
  label: string;
}
const md = `## Hello world
- one
- two
- three

\`\`\`js
const hello = 'world';
\`\`\`
`;
const htmlString = marked(md);
const TipTap: React.FC<TipTapProps> = ({ startingValue, onClickHandler, label }) => {
  const editor = useEditor({
    extensions: [StarterKit, Highlight.configure({ multicolor: true })],
    content: htmlString,
  });

  return (
    editor && (
      <div className="flex-grow-[4]">
        {/* <MenuBar onClickHandler={onClickHandler} editor={editor} label={label} /> */}
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <button
            onClick={() => {
              const text = editor.view.state.doc.textContent;
              console.log(editor.getJSON());
              console.log(editor.getHTML());
            }}
            className={editor.isActive('bold') ? 'is-active' : ''}
          >
            inspect
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight({ color: '#19414d' }).run()}
            className={editor.isActive('italic') ? 'is-active' : ''}
          >
            highlight
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'is-active' : ''}
          >
            strike
          </button>
        </BubbleMenu>
        <EditorContent className="h-full" editor={editor} />
      </div>
    )
  );
};

export default TipTap;
