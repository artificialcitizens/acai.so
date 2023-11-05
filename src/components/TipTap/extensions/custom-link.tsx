import { Node, mergeAttributes } from '@tiptap/core';
import { default as TiptapLink } from '@tiptap/extension-link';

const CustomLink = TiptapLink.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      target: {
        default: null,
        parseHTML: (element) => {
          let target = '_self';
          const href = element.getAttribute('href');
          if (
            href &&
            !href.startsWith(window.location.origin) &&
            !href.startsWith('/')
          ) {
            target = '_blank';
          }
          return target;
        },
        renderHTML: (attributes) => {
          return {
            target: attributes.target,
            rel: attributes.target === '_blank' ? 'noopener noreferrer' : null,
          };
        },
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },
});

export default CustomLink;
