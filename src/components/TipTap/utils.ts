/**
 *  Extracts the raw text content from a TipTap content object.
 */
export const extractContentFromTipTap = (tipTapContent: any): string => {
  let rawContent = '';

  if (tipTapContent.content) {
    tipTapContent.content.forEach((node: any) => {
      if (node.type === 'text') {
        rawContent += node.text;
      } else if (node.content) {
        rawContent += extractContentFromTipTap(node);
      }
    });
  }

  return rawContent;
};
