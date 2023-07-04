import React, {useState, useEffect} from 'react';
import Menu from '../components/Menu';
import type { PhotoMetadata } from '../../includes';
import { Channels } from '../../includes';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

const dftMetadata: PhotoMetadata = {
  dateCreated: '',
  filepath: '',
  filename: '',
  fileExt: '',
  unixTime: 0,
  metadata: null,
  hasExif: false
};

const Metadata = () => {
  const [ metadata, setMetadata ] = useState(dftMetadata);
  const [ filepath, setFilepath ] = useState('');

  let files: File[] = [];
  const onChange = (event: any) => {
    files = event.target.files as File[];
    if (files.length > 0) {
      const filepath = files[0].path;
      setFilepath(filepath);
      // calling IPC exposed from preload script
      window.electron.ipcRenderer.invoke(Channels.getMetadata, filepath)
        .then((metadata) => {
          setMetadata(metadata);
        })
        .catch((error) => {
          console.error(error.message)
        })
    }
  }

  const renderDate = () => {
    const birth = dayjs(metadata.dateCreated, 'YYYY:MM:DD hh:mm:ss')
    return (
      <p><strong>Date Created: </strong>{birth.format('MMM D, YYYY h:m:s')}</p>
    )
  }

  const renderGps = () => {
    if (!metadata.hasExif || !metadata.gps?.isValid) {
       return (
        <p>GPS data not found</p>
       )
    }
    return (
      <p>
        <strong>GPS:</strong> Lat: {metadata.gps.Lat} Lng: {metadata.gps.Lng}
      </p>
    )
  }
  const renderImageData = () => {
    if (!metadata.metadata) return null;
    if (!metadata.hasExif || !metadata.exif.image) {
      return (
        <p>
          <strong>Width: </strong>{metadata.metadata.width} <strong>Height: </strong>{metadata.metadata.height}
        </p>
      );
    }
    const {image, exif} = metadata.exif;
    return (
      <>
        <p>
          <strong>Width: </strong>{metadata.metadata.width || exif.ExifImageWidth} <strong>Height: </strong>{metadata.metadata.height || exif.ExifImageHeight}
        </p>
        <p>
          <strong>Camera: </strong>{image.Make} {image.Model}
        </p>
      </>
    )
  }

  return (
    <div className='page-container'>
      <Menu />
      <div>
        <h1>See Photo's Metadata</h1>
      </div>
      <form>
        <label>Choose a photo </label>
        <input
          id="chooseFolder"
          type="file"
          accept="image/png, image/jpeg"
          onChange={onChange}
        />
      </form>
      <div>
        <p><strong>Filename:</strong> {metadata.filename}{metadata.fileExt}</p>
        {renderDate()}
        <p><strong>Exif Found:</strong> {metadata.hasExif ? 'true': 'false'}</p>
        {renderGps()}
        {renderImageData()}
      </div>
    </div>
  );
}

export default Metadata;
