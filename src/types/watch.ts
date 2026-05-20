export interface FileAddedEvent {
  type: "file-added";
  path: string;
}

export interface FileRemovedEvent {
  type: "file-removed";
  path: string;
}

export interface FileRenamedEvent {
  type: "file-renamed";
  oldPath: string;
  newPath: string;
}

export type WatchEvent = FileAddedEvent | FileRemovedEvent | FileRenamedEvent;
