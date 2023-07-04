import React, { useState } from 'react';
// import PhotoFrame from 'renderer/components/PhotoFrame';
import { PhotoMetadata, Channels } from '../../includes';
import Menu from '../components/Menu';
import './Choose.css';

export enum PhotoSortOrder {
  byFilename = 'Sort by Filename',
  byDate = 'Sort by Date'
};

const sortOrders = [PhotoSortOrder.byDate, PhotoSortOrder.byFilename];

const sortByFilename = (pmA:PhotoMetadata, pmB: PhotoMetadata ) => {
  const filenameA = `${pmA.filename}${pmA.fileExt}`.toLowerCase();
  const filenameB = `${pmB.filename}${pmB.fileExt}`.toLowerCase();
  if (filenameA < filenameB) {
    return -1;
  } else if (filenameA > filenameB) {
    return 1;
  }
  return 0;
}

const sortByDate = (pmA:PhotoMetadata, pmB: PhotoMetadata ) => (pmA.unixTime - pmB.unixTime)

function Choose() {
  const { invoke } = window.electron.ipcRenderer;
  const [ pmlist, setPmlist] = useState([] as PhotoMetadata[]);
  const [ sortOrder, setSortOrder ] = useState(PhotoSortOrder.byDate);
  const [ includeList, setIncludeList ] = useState([] as boolean[]);

  const sortList = (pmList: PhotoMetadata[], sortOrder: PhotoSortOrder) => {
    switch(sortOrder) {
      case PhotoSortOrder.byDate:
        pmList = pmList.sort(sortByDate);
        break;
      case PhotoSortOrder.byFilename:
        pmList = pmList.sort(sortByFilename)
        break;
    }
    setPmlist(pmList);
  }

  const onChange = (event: { target: { files: any; }; }) => {
    const files = event.target.files;
    const promises:Promise<void>[] = [];
    const pmListT:PhotoMetadata[] = [];

    for (let i = 0; i < files.length; i += 1) {
      promises[i] =
        invoke(Channels.getMetadata, files[i].path)
        .then((metadata) => {
          pmListT[i] = metadata;
        })
        .catch((error) => {
          console.error(error.message)
        });
    }
    const fArray = Array(files.length).fill(true);
    setIncludeList(fArray);
    // after all promises have been resolved, reset the state
    Promise.all(promises)
      .then (() => {
        sortList(pmListT, sortOrder);
      })
  }

  //draw the photos with assorted metadata
  const renderPhotos = () => {
    return (
      <div className='flexy'>
        {pmlist.map((pm: PhotoMetadata, i: number) => {
          return (
            <p>{pm.filepath}</p>
            // <PhotoFrame
            //   key={pm.filepath}
            //   pm={pm}
            //   toInclude={includeList[i]}
            //   updateState = {(include: boolean) => {
            //     const ilT = includeList.slice(0);
            //     ilT[i] = include;
            //     setIncludeList(ilT);
            //   }}
            // />
          )
        })}
      </div>
    )
  }

  const createSelectionList = () => {
    const listT:PhotoMetadata[] = [];

    pmlist.forEach((pm, i) => {
      if (includeList[i]) {
        listT.push(pmlist[i]);
      }
    });
    setPmlist(listT);
  }

  // dropdown that allows changing the sort order
  const renderSortOrder = ()  => {

    return (
      <select
        id="sortOrder"
        value={sortOrder}
        onChange={(e) => {
          setSortOrder(e.target.value as PhotoSortOrder);
          sortList(pmlist, e.target.value as PhotoSortOrder);
        }}
      >
        {sortOrders.map(sortOrder => {
          return (
            <option key={sortOrder} value={sortOrder}>{sortOrder}</option>
          )
        })}
      </select>
    )
  }

  return (
    <div>
      <Menu />
      <div>
        <h1>Select all Your Photos</h1>
      </div>
      <form>
        {/* <fieldset>
          <legend>Choose a Complete Folder</legend>
          <input
            id="chooseFolder"
            type="file"
            accept="image/png, image/jpeg"
            multiple
            webkitdirectory="true"
            onChange={onChange}
          />
        </fieldset>
        <h2>OR</h2> */}
        <fieldset>
          <legend>Choose Multiple Photos</legend>
          <input
            id="chooseFolder"
            type="file"
            accept="image/png, image/jpeg"
            multiple
            onChange={onChange}
          />
        </fieldset>
        {renderSortOrder()}
      </form>
      <p>
        Find all your photos and select them at this stage.
        Decide which photos are worth showcasing and remove photos that
        just don't tell the story you want to tell by unchecking the include checkbox.
      </p>
      <hr />
      {renderPhotos()}
      <p>
        After unchecking photos you think are not going to make the cut, press the next button to move to the next step.
      </p>
      <button id="curatedBtn" onClick={createSelectionList}>Remember Selected Photos</button>
    </div>
  );
}


export default Choose;
