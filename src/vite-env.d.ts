// Tell TypeScript about Vite-specific types (e.g. import.meta.env)
/// <reference types="vite/client" />

// Declare that importing a .png file gives you a string (the URL path to the image)
declare module '*.png' {
  const src: string;
  export default src;
}

// Same for .jpg files
declare module '*.jpg' {
  const src: string;
  export default src;
}

// Same for .jpeg files
declare module '*.jpeg' {
  const src: string;
  export default src;
}

// Same for .svg files (inline SVG or URL)
declare module '*.svg' {
  const src: string;
  export default src;
}

// Same for .gif files
declare module '*.gif' {
  const src: string;
  export default src;
}

// Same for .webp files
declare module '*.webp' {
  const src: string;
  export default src;
}
