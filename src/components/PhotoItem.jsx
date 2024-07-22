import React from "react";

function PhotoItem({ photo, onPhotoSelect }) {
  return (
    <div className="photo-item" onClick={() => onPhotoSelect(photo)}>
      <img src={photo.webContentLink} alt={photo.name} />
      <p>{photo.name}</p>
    </div>
  );
}

export default PhotoItem;
