import React, { useEffect } from 'react';
import { Editor } from '@tiptap/react'; // Assuming you are using the prosemirror package
import { TextSelection } from '@tiptap/pm/state';

interface TypingSuggestionProps {
  editor: Editor;
}

const Autocomplete: React.FC<TypingSuggestionProps> = ({ editor }) => {
  useEffect(() => {
    const onTypingStart = (editor: Editor) => {
      let timer: NodeJS.Timeout;
      let isSuggesting = false;
      const text = 'Hello, World!';

      function handleKeyPress(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === 'Tab' || event.key === 'Escape') {
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
        // Remove the event listener
        editor.view.dom.removeEventListener('keydown', handleKeyPress);
      }

      function handleMouseDown() {
        // Remove the suggested text
        const newText = editor.view.state.doc.textContent.replace(text, '');
        editor.commands.setContent(newText);

        // Remove the event listeners
        editor.view.dom.removeEventListener('keydown', handleKeyPress);
        editor.view.dom.removeEventListener('mousedown', handleMouseDown);
      }

      function onTyping(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === 'Backspace') {
          return;
        }

        if (!editor.view.hasFocus()) {
          return;
        }

        clearTimeout(timer);
        timer = setTimeout(() => {
          isSuggesting = true;
          const cursorPosition = editor.view.state.selection.from;
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
        }, 1500);
      }

      editor.view.dom.addEventListener('keydown', onTyping);
      editor.view.dom.addEventListener('keydown', handleKeyPress);
      editor.view.dom.addEventListener('mousedown', handleMouseDown);

      return () => {
        editor.view.dom.removeEventListener('keydown', onTyping);
        editor.view.dom.removeEventListener('keydown', handleKeyPress);
        editor.view.dom.removeEventListener('mousedown', handleMouseDown);
      };
    };

    onTypingStart(editor);
  }, [editor]);

  return null;
};

export default Autocomplete;
