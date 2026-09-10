"use client";

import * as React from "react";
import { Button, Icon } from "@noorddev/vlak-react";

type LibraryPhoto = { id: string; name: string; src: string; favorite: boolean };

/** Local library with functional collection filtering and full-bleed thumbnails. */
export function IOSPhotos({ photos, onOpen, onCamera }: { photos: LibraryPhoto[]; onOpen: (id: string) => void; onCamera: () => void }) {
  const [favorites, setFavorites] = React.useState(false);
  const shown = favorites ? photos.filter(photo => photo.favorite) : photos;
  return <div className="mo-ios-photos-app">
    <div className="mo-ios-photos-caption"><span>{favorites ? "Favorites" : "Library"}</span><span>{shown.length} {shown.length === 1 ? "photo" : "photos"}</span></div>
    <div className="mo-photo-grid">{shown.map(photo => <Button variant="ghost" key={photo.id} aria-label={`Open ${photo.name}`} onClick={() => onOpen(photo.id)}><img src={photo.src} alt={photo.name} />{photo.favorite && <svg className="mo-ios-photos-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21 3 12C-3 5 6-1 12 6c6-7 15-1 9 6Z" /></svg>}</Button>)}</div>
    {!shown.length && <div className="mo-ios-photos-empty"><Icon name={favorites ? "star" : "image"} size={24} style={{ width: 40, height: 40 }} /><h3>{favorites ? "No Favorites" : "Your library is empty"}</h3><p>{favorites ? "Mark a photo as a favorite to keep it here." : "Capture a sample photo to add it to your library."}</p></div>}
    <div className="mo-ios-photos-toolbar"><div className="mo-ios-photos-filter" role="group" aria-label="Photo collection"><Button variant="ghost" aria-pressed={!favorites} onClick={() => setFavorites(false)}>Library</Button><Button variant="ghost" aria-pressed={favorites} onClick={() => setFavorites(true)}>Favorites</Button></div><Button variant="ghost" aria-label="Open camera" onClick={onCamera}><Icon name="camera" size={24} style={{ width: 24, height: 24 }} /></Button></div>
  </div>;
}
