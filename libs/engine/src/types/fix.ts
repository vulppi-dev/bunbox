declare global {
  /** Squoosh fix type imageData */
  export interface ImageData {
    data: Uint16Array;
    width: number;
    height: number;
  }
}
