import * as yaml from 'js-yaml';

interface Json {
  [key: string]: any;
}

export const jsonToYaml = (json: Json): string | undefined => {
  try {
    const yamlStr = yaml.dump(json);
    return yamlStr;
  } catch (e) {
    console.error(e);
  }
};

export const yamlToJson = (yamlStr: string): Json | undefined => {
  try {
    const result = yaml.load(yamlStr);
    return result as Json;
  } catch (e) {
    console.error(e);
  }
};

export function timestampToHumanReadable(): string {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export function baseEncode(text: string): string {
  const base64 = btoa(unescape(encodeURIComponent(text)));
  return encodeURIComponent(base64);
}

// Helper function to slugify a string
export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to read a file as text
export function readFileAsText(file) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

// const yamlStr = `
// userName: Josh Mabry
// currentLocation: Portland, Oregon
// localTime: Tue Fri July 11 6:09 PM
// workspaces:
// - 'UUIDxyz':
//   name: Knapsack
//   createdAt: Tue Fri July 11 6:09 PM
//   lastUpdated: Tue Fri July 11 6:09 PM
//   private: true
//   settings:
//     webSpeechRecognition: true
//     tts: false
//     whisper: false
//   data:
//     tiptap:
//         'UUIDxzya': 'html string'
//     chat:
//     agentLogs:
//       thoughts:
//        - 'test'
//        - 'test1'
//       errors:
//     agentTools:
//       calculator: true
//       weather: true
//       googleSearch: true
//       webBrowser: true
//       createDocument: true
//     notes: ''
// - 'UUIDxyza':
//   name: Knapsack
//   createdAt: Tue Fri July 11 6:09 PM
//   lastUpdated: Tue Fri July 11 6:09 PM
//   private: true
//   settings:
//     webSpeechRecognition: true
//     tts: false
//     whisper: false
//   data:
//     tiptap:
//         'UUIDxzya': 'html string'
//     chat:
//     agentLogs:
//       thoughts:
//        - 'test'
//        - 'test1'
//       errors:
//     agentTools:
//       calculator: true
//       weather: true
//       googleSearch: true
//       webBrowser: true
//       createDocument: true
//     notes: ''
// `;

// const json = yamlToJson(yamlStr);
// console.log(json);

// const yamlStr2 = jsonToYaml(json);

// console.log(yamlStr2);
