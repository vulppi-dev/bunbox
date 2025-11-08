declare global {
  module '*.wgsl' {
    const content: string;
    export default content;
  }
}

export {};
