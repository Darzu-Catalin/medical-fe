declare module 'ogl' {
  // Minimal typing fallback to satisfy TS in our usage context
  export class Renderer {
    constructor(options?: any)
    gl: WebGLRenderingContext | WebGL2RenderingContext
    setSize: (width: number, height: number) => void
    render: (args: any) => void
  }
  export class Program {
    constructor(gl: any, opts: any)
    uniforms: any
  }
  export class Mesh {
    constructor(gl: any, opts: any)
  }
  export class Triangle {
    constructor(gl: any)
  }
  export class Vec2 {
    constructor(x?: number, y?: number)
    set: (x: number, y: number) => void
  }
}
