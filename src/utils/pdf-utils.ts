export const getPdfText = async (
  pdf: any,
  filename: string,
): Promise<{ [filename: string]: { page: number; content: string }[] }> => {
  const numPages = pdf.numPages;
  const pageTextPromises = Array.from({ length: numPages }, async (_, i) => {
    const pageIndex = i + 1;
    const page = await pdf.getPage(pageIndex);
    const textContent = await page.getTextContent();
    const textItems = textContent.items
      .map((item: any) => ('str' in item ? item.str ?? '' : ''))
      .join(' ');
    return { page: pageIndex, content: textItems };
  });

  const pages = await Promise.all(pageTextPromises);
  return { [filename]: pages };
};
