import { TextSelection } from '@tiptap/pm/state';
import { BubbleMenu, Editor, EditorContent, useEditor } from '@tiptap/react';

export const autocomplete = ({ editor }: { editor: Editor }) => {
  const cursorPosition = editor.view.state.selection.from;
  const text = 'Hello, World!';

  // Insert the text after the cursor position with a background color mark
  const transaction = editor.view.state.tr
    .insertText(text, cursorPosition)
    .addMark(
      cursorPosition,
      cursorPosition + text.length,
      editor.view.state.schema.marks.highlight.create({ color: '#354d4f' }),
    );
  editor.view.dispatch(transaction);
  const newPosition = TextSelection.create(editor.view.state.doc, cursorPosition);
  editor.view.dispatch(editor.view.state.tr.setSelection(newPosition));
  return text;
};

const handleAutocompleteKeyPress = (event: KeyboardEvent, editor: Editor, text: string) => {
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
  // Remove the event listener
  editor.view.dom.removeEventListener('keydown', () => handleAutocompleteKeyPress(event, editor, text));
};
