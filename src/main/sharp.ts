import sharp from "sharp";
import fs from "fs-extra";
import path from "node:path";
import { ExifImage } from 'node-exif';
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { ExifGeneric, PhotoMetadata, exifDateFormat } from "../includes";

dayjs.extend(customParseFormat);

// decimal from Degrees, minutes, seconds
export const decFromDms = (gps: number[]) => (gps[0] + gps[1] / 60 + gps[2] / 3600)

// returns true if item passed in is an array
export const isArray = (item:any) => (item.constructor == Array);

// convert gps degrees, minutes, second into decimal Latitude and Longitude
export const gpsToDecimal = (gps: any) => {
  const errorReturn = {
    isValid: false,
    Lat: 0,
    Lng: 0
  };

  if (typeof gps !== "object") return errorReturn;
  const {GPSLatitudeRef, GPSLatitude, GPSLongitudeRef, GPSLongitude} = gps;
  if (typeof GPSLatitudeRef === "string" && typeof GPSLongitudeRef === "string" &&
    isArray(GPSLatitude) && isArray(GPSLongitude)) {
      const latSign = GPSLatitudeRef.toUpperCase() === "N" ? 1 : -1;
      const lngSign = GPSLongitudeRef.toUpperCase() === "E" ? 1 : -1;
      return {
        isValid: true,
        Lat: latSign * decFromDms(GPSLatitude),
        Lng: lngSign * decFromDms(GPSLongitude)
      }
  }
  return errorReturn;
}

// returns a promise that won't be resolved until asynchronous calls are finished
export const getImgMetadata = (imgPath: string) => {
  const promise = new Promise((resolve, reject) => {
    try {
      const { name, ext } = path.parse(imgPath);
      const imgSharp = sharp(imgPath);

      imgSharp.metadata()
        .then(metadata => {
          new ExifImage({image: imgPath}, (error: Error | null, exifData: ExifGeneric) => {
            const unixTime = fs.statSync(imgPath).birthtime.getTime();
            const exifLikeDate = dayjs(unixTime).format(exifDateFormat);
            let result;
            if (error) {
              result = {
                filepath: imgPath,
                filename: name,
                fileExt: ext,
                dateCreated: exifLikeDate,
                unixTime,
                metadata,
                hasExif: false
              } as PhotoMetadata;
            } else {
              const bestTime = exifData.exif.DateTimeOriginal || exifData.exif.CreateDate || exifLikeDate;
              result = {
                filepath: imgPath,
                filename: name,
                fileExt: ext,
                dateCreated: bestTime,
                unixTime: dayjs(bestTime, exifDateFormat).unix(),
                metadata,
                hasExif: true,
                exif: exifData,
                gps: gpsToDecimal(exifData.gps),
              } as PhotoMetadata;
            }
            resolve(result);
          })
      });
    } catch(err) {
      console.error(err);
      reject(err);
    }
  });
  return promise;
}

export type ResizeFit = 'cover' | 'contain' | 'fill' | 'inside' | 'outside';

export type ResizeOptions = {
  pathFrom: string;
  pathTo: string;
  width: number;
  height?: number;
  fit?: ResizeFit;
};

export const imgResize = (options: ResizeOptions) => {
  const {pathFrom, pathTo, width, height} = options;
  const promise = new Promise((resolve, reject) => {
    try {
      const { name, ext } = path.parse(pathFrom);
      const imgSharp = sharp(pathFrom);

      imgSharp.metadata()
        .then(metadata => {
          const safeWidth = metadata.width || 0;
          if ( safeWidth > width) {
            imgSharp.resize({
                width,
                height
              })
              .toFile(`${pathTo}/${name}${ext}`);
          } else {
            fs.copyFileSync(pathFrom, pathTo);
          }
          resolve(true);
        })
      } catch (error) {
        console.error(error);
        reject(error);
      }

    })
  return promise;
}
