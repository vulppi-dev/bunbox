declare global {
  export interface ImageData {
    data: Uint16Array;
    width: number;
    height: number;
  }
}
