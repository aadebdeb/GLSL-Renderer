(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GLSL = factory();
  }
}(typeof self !== 'undefined' ? self : this, function() {

  var VERTEX_SHADER_SOURCE = [
    'attribute vec3 aPosition;',
    '',
    'void main() {',
    '  gl_Position = vec4(aPosition, 1.0);',
    '}'
  ].join('');

  var POSITION_ARRAY = [
    -1.0,  1.0,  0.0,
    -1.0, -1.0,  0.0,
     1.0,  1.0,  0.0,
     1.0, -1.0,  0.0
  ];

  var GLSL = function(options) {
    this._canvas = document.createElement('canvas');
    this._gl = this._canvas.getContext('webgl');

    this.setSize(options.width || 640, options.height || 480);

    this._mousePosition = {x: 0, y: 0};
    this._mousePressed = false;
    this._canvas.addEventListener('mousemove', this._handleMouseMove.bind(this), false);
    this._canvas.addEventListener('mousedown', this._handleMouseDown.bind(this), false);
    this._canvas.addEventListener('mouseup', this._handleMouseUp.bind(this), false);

    this._startTime = null;

    this._vertexShader = this._gl.createShader(this._gl.VERTEX_SHADER);
    this._gl.shaderSource(this._vertexShader, VERTEX_SHADER_SOURCE);
    this._gl.compileShader(this._vertexShader);

    this._positionBuffer = this._createPositionBuffer();

    this._program = null;
    if (options.source) {
      this.setSource(options.source);
    }
  };

  /**
   * @private
   */
  GLSL.prototype._handleMouseMove = function(e) {
    this._mousePosition.x = e.clientX;
    this._mousePosition.y = this._canvas.height - e.clientY;
  };

  /**
   * @private
   */
  GLSL.prototype._handleMouseDown = function() {
    this._mousePressed = true;
  };

  /**
   * @private
   */
  GLSL.prototype._handleMouseUp = function() {
    this._mousePressed = false;
  };

  /**
   * @private
   */
  GLSL.prototype._createPositionBuffer = function() {
    var buffer = this._gl.createBuffer();
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);
    this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(POSITION_ARRAY), this._gl.STATIC_DRAW);
    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    return buffer;
  };

  /**
   * gets canvas element
   * @return [Element] canvas
   */
  GLSL.prototype.getCanvas = function() {
    return this._canvas;
  };

  /**
   * gets webgl context
   * @return [WebGLRenderingContext] context
   */
  GLSL.prototype.getContext = function() {
    return this._gl;
  }

  /**
   * sets size of canvas
   * @param [number] width - width of canvas
   * @param [number] height - height of canvas
   */
  GLSL.prototype.setSize = function(width, height) {
    this._canvas.width = width;
    this._canvas.height = height;
    this._gl.viewport(0, 0, this._canvas.width, this._canvas.height);
  };

  /**
   * sets width of canvas
   * @param [number] width - width of canvas
   */
  GLSL.prototype.setWidth = function(width) {
    this._canvas.width = width;
    this._gl.viewport(0, 0, this._canvas.width, this._canvas.height);
  };

  /**
   * sets height of canvas
   * @param [number] height - height of canvas
   */
  GLSL.prototype.setHeight = function(height) {
    this._canvas.height = height;
    this._gl.viewport(0, 0, this._canvas.width, this._canvas.height);
  };

  /**
   * sets source of fragment shader
   * @param [string] source - source of fragment shader
   */
  GLSL.prototype.setSource = function(source) {
    var shader;

    shader = this._gl.createShader(this._gl.FRAGMENT_SHADER);
    this._gl.shaderSource(shader, source);
    this._gl.compileShader(shader);

    if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
      throw new Error('Can not compile shader source [' + this._gl.getShaderInfoLog(shader) + ']');
    }

    this._program = this._gl.createProgram();
    this._gl.attachShader(this._program, this._vertexShader);
    this._gl.attachShader(this._program, shader);
    this._gl.linkProgram(this._program);

    if (!this._gl.getProgramParameter(this._program, this._gl.LINK_STATUS)) {
      throw new Error('Can not link program [' + this._gl.getProgramInfoLog(this._program) + ']')
    }

    this._gl.useProgram(this._program);

    this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._positionBuffer);
    this._gl.enableVertexAttribArray(this._gl.getAttribLocation(this._program, 'aPosition'));
    this._gl.vertexAttribPointer(this._gl.getAttribLocation(this._program, 'aPosition'), 3, this._gl.FLOAT, false, 0, 0);
  };

  /**
   * sets clear color
   * @param [number] r - red
   * @param [number] g - green
   * @param [number] b - blue
   * @param [number] a - alpha
   */
  GLSL.prototype.setClearColor = function(r, g, b, a) {
    this.setClearColor(r, g, b, a);
  };

  /**
   * sets user defined uniform variable
   * this method doesn't support non-arrayed value
   * @param [string] type - type of uniform
   * @param [string] name - name of niform variable
   * @param [number] value - value of uniform variable
   */
  GLSL.prototype.setUniform = function(type, name, value) {
    this._gl['uniform' + type](this._gl.getUniformLocation(this._program, name), value);
  }

  /**
   * renders to canvas
   */
  GLSL.prototype.render = function() {
    var elapsedTime;

    if (!this._startTime) {
      this._startTime = new Date().getTime();
    }
    elapsedTime = new Date().getTime() - this._startTime;

    this._gl.uniform2fv(this._gl.getUniformLocation(this._program, 'uResolution'), [this._canvas.width, this._canvas.height]);
    this._gl.uniform1f(this._gl.getUniformLocation(this._program, 'uTime'), elapsedTime);
    this._gl.uniform2fv(this._gl.getUniformLocation(this._program, 'uMousePosition'), [this._mousePosition.x, this._mousePosition.y]);
    this._gl.uniform1i(this._gl.getUniformLocation(this._program, 'uMousePressed'), this._mousePressed);

    this._gl.clear(this._gl.COLOR_BUFFER_BIT);
    this._gl.drawArrays(this._gl.TRIANGLE_STRIP, 0, 4);
    this._gl.flush();
  };

  return GLSL;
}));
