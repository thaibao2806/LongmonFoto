import React from 'react';
import PhotoItem from './PhotoItem';

function PhotoList({ photos, onPhotoSelect }) {
  return (
    <div className="photo-list">
      {photos.map((photo) => (
        <PhotoItem key={photo.id} photo={photo} onPhotoSelect={onPhotoSelect} />
      ))}
    </div>
  );
}

export default PhotoList;
