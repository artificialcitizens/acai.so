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
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const newMinutes = minutes < 10 ? '0' + minutes : minutes;

  const strTime = hours + ':' + newMinutes + ' ' + ampm;

  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const dayOfWeek = days[date.getDay()];

  const dayOfMonth = date.getDate();

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const month = months[date.getMonth()];

  return `${dayOfWeek}, ${month} ${dayOfMonth}, ${date.getFullYear()} ${strTime}`;
}

export function baseEncode(text: string): string {
  const base64 = btoa(unescape(encodeURIComponent(text)));
  return encodeURIComponent(base64);
}

// Helper function to slugify a string
export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to read a file as text
export function readFileAsText(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

export const writeToLocalStorage = (key: string, data: any): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const readFromLocalStorage = (key: string): any => {
  const rawData = localStorage.getItem(key);
  return rawData ? JSON.parse(rawData) : null;
};

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
