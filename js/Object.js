class DrawableObject {
  shader = null;
  vertexBuffers = {};
  attributeLocations = null;
  uniformLocations = null;
  elementArrayBuffer = null;
  verticesCount = null;

  /**
   * uniform setup - this is a function that should be defined per drawable
   * If you are familiar with C++ and not JavaScript, treat this as a member variable
   * that is a function. 
   */
  UniformSetup = () => {
    if(!this.uniformSetupWarned) {
      console.warn('A drawable being drawn does not have a uniformSetup function.');
      this.uniformSetupWarned = true;
    }
  };

  constructor(
    GL,
    shader,
    bufferMap,
    elementBuffer = null,
    verticesCount = null
  ) {
    this.shader = shader;
    this.GL = GL;

    if (!elementBuffer && !verticesCount) {
      throw 'You must specify an element Index Buffer or vertices count!';
    }

    const attributeNames = Object.keys(bufferMap);
    const attributeLocations = shader.GetAttributeLocations(attributeNames);
    
    for (let attributeName in bufferMap) {
      const location = attributeLocations[attributeName];
      
      this.vertexBuffers[location] = bufferMap[attributeName];
    }

    if (elementBuffer) {
      this.elementArrayBuffer = elementBuffer;
    } else {
      this.verticesCount = verticesCount;
    }
  }

  // DRAWS DRAWABLE TO SCREEN
  Draw() {
    if (this.elementArrayBuffer && !this.verticesCount) {
      this.elementArrayBuffer.BindAndEnable();
    }

    for (let bufferLocation in this.vertexBuffers) {
      this.vertexBuffers[bufferLocation].BindAndEnable(bufferLocation);
    }

    this.GL.useProgram(this.shader.shaderProgram);

    this.UniformSetup();

    if (this.verticesCount) {
      this.GL.drawArrays(this.GL.TRIANGLES, 0, this.verticesCount);
      return;
    }

    const offset = 0;
    this.GL.drawElements(
      this.GL.TRIANGLES,
      this.elementArrayBuffer.count,
      this.elementArrayBuffer.type,
      offset
    );
  }
}