export const docsContent = [
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        marks: [
          {
            type: 'code',
          },
        ],
        text: '⚠️ This is an early public preview and is in active development. Stuff will break, I promise ⚠️',
      },
    ],
  },
  {
    type: 'paragraph',
  },
  {
    type: 'heading',
    attrs: {
      level: 1,
    },
    content: [
      {
        type: 'text',
        marks: [
          {
            type: 'bold',
          },
        ],
        text: 'Introduction',
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        marks: [
          {
            type: 'link',
            attrs: {
              href: 'http://acai.so',
              target: '_blank',
              class:
                'text-acai-white underline underline-offset-[3px] hover:text-stone-600 transition-colors cursor-pointer text-acai-white underline underline-offset-[3px] hover:text-stone-600 transition-colors cursor-pointer',
            },
          },
        ],
        text: 'acai.so',
      },
      {
        type: 'text',
        text: ' is a collection of AI powered tools to supercharge your workflow and accelerate your creativity.',
      },
    ],
  },
  {
    type: 'paragraph',
  },
  {
    type: 'heading',
    attrs: {
      level: 2,
    },
    content: [
      {
        type: 'text',
        marks: [
          {
            type: 'bold',
          },
        ],
        text: 'Quick Start',
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'Go to settings at the top of the right sidebar and enter your API keys. ',
      },
    ],
  },
  {
    type: 'paragraph',
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: "At a minimum, you'll need an OpenAI key to access the chat functionality. You can get a key at ",
      },
      {
        type: 'text',
        marks: [
          {
            type: 'link',
            attrs: {
              href: 'https://platform.openai.com/',
              target: '_blank',
              class:
                'text-acai-white underline underline-offset-[3px] hover:text-stone-600 transition-colors cursor-pointer',
            },
          },
        ],
        text: 'https://platform.openai.com/',
      },
      {
        type: 'text',
        text: ' ',
      },
      {
        type: 'hardBreak',
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: "You'll also need a custom google search engine id and key to use the research mode",
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        marks: [
          {
            type: 'link',
            attrs: {
              href: 'https://tdinh.notion.site/tdinh/How-to-get-Search-Engine-ID-and-API-Key-on-Programmable-Search-Engine-by-Google-b861a749b20f4fcdbc1449f92ad9ed9a',
              target: '_blank',
              class:
                'text-acai-white underline underline-offset-[3px] hover:text-stone-600 transition-colors cursor-pointer',
            },
          },
        ],
        text: 'https://tdinh.notion.site/tdinh/How-to-get-Search-Engine-ID-and-API-Key-on-Programmable-Search-Engine-by-Google-b861a749b20f4fcdbc1449f92ad9ed9a',
      },
    ],
  },
  {
    type: 'paragraph',
  },
  {
    type: 'heading',
    attrs: {
      level: 2,
    },
    content: [
      {
        type: 'text',
        marks: [
          {
            type: 'bold',
          },
        ],
        text: 'AVA',
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'AVA is your automated virtual agent; a collection of AI models, natural language processing, and data driven pipelines to help you do more and learn faster.',
      },
    ],
  },
  {
    type: 'paragraph',
  },
  {
    type: 'heading',
    attrs: {
      level: 3,
    },
    content: [
      {
        type: 'text',
        text: 'Agent Modes',
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'AVA, the Automated Virtual Assistant, operates in different modes to provide a variety of services to the user. These can be updated in the ',
      },
      {
        type: 'text',
        marks: [
          {
            type: 'bold',
          },
        ],
        text: 'settings',
      },
      {
        type: 'text',
        text: ' panel.',
      },
    ],
  },
  {
    type: 'paragraph',
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'The modes are:',
      },
    ],
  },
  {
    type: 'orderedList',
    attrs: {
      tight: true,
      start: 1,
    },
    content: [
      {
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'code',
                  },
                ],
                text: 'ava',
              },
              {
                type: 'text',
                text: " - This is the default mode where AVA interacts with the user and provides appropriate responses based on the user's input.",
              },
            ],
          },
        ],
      },
      {
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'code',
                  },
                ],
                text: 'chat',
              },
              {
                type: 'text',
                text: ' - This is a standard chat interface and allows the user to talk to AVA without any agent tools slowing down the interaction. Set a custom prompt and the chat model in the ',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'bold',
                  },
                ],
                text: 'settings',
              },
              {
                type: 'text',
                text: ' panel',
              },
            ],
          },
        ],
      },
      {
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'code',
                  },
                ],
                text: 'create',
              },
              {
                type: 'text',
                text: ' - For creating documents, AVA can generate stories, shopping lists, etc.',
              },
            ],
          },
        ],
      },
      {
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'code',
                  },
                ],
                text: 'research',
              },
              {
                type: 'text',
                text: " - Assists the user in researching topics and reports back to the user with it's findings.",
              },
            ],
          },
        ],
      },
      {
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'code',
                  },
                ],
                text: 'writer',
              },
              {
                type: 'text',
                text: ' - Provides writing assistance and gives AVA access to the current open document. AVA can help the user improve their writing, provide suggestions, and more.',
              },
            ],
          },
        ],
      },
      {
        type: 'listItem',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'code',
                  },
                ],
                text: 'custom',
              },
              {
                type: 'text',
                text: ' - This mode allows for a custom server to connect to the ',
              },
              {
                type: 'text',
                marks: [
                  {
                    type: 'link',
                    attrs: {
                      href: 'http://acai.so',
                      target: '_blank',
                      class:
                        'text-acai-white underline underline-offset-[3px] hover:text-stone-600 transition-colors cursor-pointer',
                    },
                  },
                ],
                text: 'acai.so',
              },
              {
                type: 'text',
                text: ' interface, giving developers a platform to develop their own intelligent digital workers.',
              },
            ],
          },
        ],
      },
    ],
  },
];
