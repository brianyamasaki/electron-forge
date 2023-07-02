
export enum Channels {
  ipcTest = "ipc-example",
  getMetadata = "get-metadata"
}

export const validChannels = [
  Channels.ipcTest,
  Channels.getMetadata
];

type GpsDecimal = {
  isValid: boolean;
  Lat: number;
  Lng: number;
};

export type ExifGeneric = {
  image?: any;
  thumbnail?: any;
  exif?: any;
  gps?: any;
  interoperability?: any;
  makernote?: any;
};

export type PhotoMetadata = {
  filepath: string;
  filename: string;
  fileExt: string;
  dateCreated: string;
  unixTime: number;
  metadata: any;
  hasExif: boolean;
  exif?: any;
  gps?: GpsDecimal;
  image?: any;
};

export const exifDateFormat = 'YYYY:MM:DD hh:mm:ss';
export const userDateFormat = 'MMM D, YYYY h:m:s';
