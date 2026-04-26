export type UploadInput = {
  /** Relative storage key, e.g. "products/123/main.jpg". */
  key: string;
  contentType: string;
  body: Buffer | Uint8Array;
};

export type UploadResult = {
  key: string;
  url: string;
  size: number;
  driver: string;
};

export interface StorageDriver {
  readonly name: string;
  upload(input: UploadInput): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getPublicUrl(key: string): string;
}
