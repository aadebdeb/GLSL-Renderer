GLSL-Renderer
====

GLSL-Renderer is a simple library for shader art by WebGL.

## Usage

```
// creates a GLSL instance
var glsl = new GLSL();

// sets canvas size
glsl.setSize(640, 480);

// sets source fragment shader
glsl.setSource(source);

// appends canvas element to body
document.body.appendChild(glsl.getCanvas());

// renders once
glsl.render();
```

Please see sample files in samples directory.

Available uniform variables are listed below.

```
vec2 uResolution - canvas size
float uTime - milliseconds since render method first called
vec2 uMousePosition - mouse position in canvas
bool uMousePressed - whether mouse is pressed or not
```

if you want to use other uniform variables, please use `setUniform` method.

## License

This project is licensed under the MIT License.

## Author

aadebdeb
