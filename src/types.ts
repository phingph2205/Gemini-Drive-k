export interface FileMetadata {
  id: number;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: string;
  notes: string;
  path: string;
}

export type FileTypeFilter = 'all' | 'image' | 'document' | 'other';
