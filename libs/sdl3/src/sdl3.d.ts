declare global {
  module '*.dylib' {
    const src: string;
    export default src;
  }

  module '*.so.2' {
    const src: string;
    export default src;
  }

  module '*.so' {
    const src: string;
    export default src;
  }

  module '*.dll' {
    const src: string;
    export default src;
  }
}

export {};
