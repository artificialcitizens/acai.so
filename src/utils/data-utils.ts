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

export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Helper function to slugify a string
export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const readFileAsText = (
  file: File,
  fileType: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target) return reject('No target');
      let text = event.target.result as string;
      if (fileType === 'txt') {
        text = text.replace(/\r\n|\n/g, '<br/>');
      }
      resolve(text);
    };

    reader.onerror = (error) => reject(error);

    reader.readAsText(file);
  });
};

export const writeToLocalStorage = (key: string, data: any): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const readFromLocalStorage = (key: string): any => {
  const rawData = localStorage.getItem(key);
  return rawData ? JSON.parse(rawData) : null;
};

export const getObjectSize = (
  obj: object,
  unit: 'KB' | 'MB' = 'KB',
): number => {
  const jsonString = JSON.stringify(obj);
  const objectSizeInBytes = new Blob([jsonString]).size;

  let objectSize: number;

  if (unit === 'KB') {
    objectSize = objectSizeInBytes / 1024;
  } else if (unit === 'MB') {
    objectSize = objectSizeInBytes / (1024 * 1024);
  } else {
    throw new Error('Invalid unit specified. Please use "KB" or "MB".');
  }

  return objectSize;
};
