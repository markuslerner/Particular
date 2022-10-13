import * as THREE from 'three';
import { GPUComputationRenderer } from '/node_modules/three/examples/jsm/misc/GPUComputationRenderer.js';

import SimplePhysics from './SimplePhysics.js';

export default class GPUPhysics extends SimplePhysics {
  constructor(props) {
    const {
      buffersize = 4, // max number of particles, needs to be power of 2
    } = props;
    super(props);

    this.buffersize = buffersize;

    const container = document.createElement('div');
    document.body.appendChild(container);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      3000
    );
    this.camera.position.z = 350;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    this.gpuCompute = new GPUComputationRenderer(
      Math.sqrt(this.buffersize),
      Math.sqrt(this.buffersize),
      this.renderer
    );

    if (this.renderer.capabilities.isWebGL2 === false) {
      this.gpuCompute.setDataType(THREE.HalfFloatType);
    }

    this.textures = {
      position: this.gpuCompute.createTexture(),
      velocity: this.gpuCompute.createTexture(),
    };

    fillPositionTexture(this.textures.position);
    fillVelocityTexture(this.textures.velocity);

    this.positionVariable = this.gpuCompute.addVariable(
      'texturePosition',
      fragmentShaderPosition,
      this.textures.position
    );
    this.velocityVariable = this.gpuCompute.addVariable(
      'textureVelocity',
      fragmentShaderVelocity,
      this.textures.velocity
    );

    this.gpuCompute.setVariableDependencies(this.velocityVariable, [
      this.positionVariable,
      this.velocityVariable,
    ]);
    this.gpuCompute.setVariableDependencies(this.positionVariable, [
      this.positionVariable,
      this.velocityVariable,
    ]);

    this.positionUniforms = this.positionVariable.material.uniforms;
    this.velocityUniforms = this.velocityVariable.material.uniforms;

    this.positionUniforms['delta'] = { value: 1.0 };

    this.velocityUniforms['delta'] = { value: 1.0 };

    this.positionVariable.wrapS = this.positionVariable.wrapT =
      THREE.RepeatWrapping;
    this.velocityVariable.wrapS = this.velocityVariable.wrapT =
      THREE.RepeatWrapping;

    const error = this.gpuCompute.init();
    if (error) {
      console.error('GPUPhysics', error);
    }
  }

  addParticle(particle) {
    const i = this.particles.size;
    const p = super.addParticle(particle);

    const { data } = this.textures.position.image;

    const index = i * 4;

    if (index < data.length) {
      data[index] = p.x;
      data[index + 1] = p.y;
      data[index + 2] = p.z;
    } else {
      console.error(
        'GPUPhysics',
        'buffer size (' + this.buffersize + ') exceeded'
      );
    }
  }

  updateParticles(deltaTime) {
    this.positionUniforms['delta'].value = deltaTime;
    this.velocityUniforms['delta'].value = deltaTime;

    // console.log('updateParticles()');
    // for (const particle of this.particles) {
    //   if (particle.neighbors === null) {
    //     particle.neighbors = this.particles;
    //   }
    //
    //   for (const behavior of this.behaviors) {
    //     behavior.apply(particle);
    //   }
    //
    //   particle.scaleVelocity(1 - this.friction);
    //   particle.update(deltaTime);
    // }

    this.gpuCompute.compute();

    // console.log(this.textures.position.image.data);
    // console.log(this.textures.velocity.image.data);

    console.log(
      this.gpuCompute.getCurrentRenderTarget(this.positionVariable).texture
    );

    var gl = this.renderer.getContext();

    // console.log(gl);

    this.renderer.render(this.scene, this.camera);
  }
}

const fragmentShaderPosition = `
  uniform float delta;
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 texel = texture2D( texturePosition, uv );
    vec3 position = texel.xyz;
    vec3 velocity = texture2D( textureVelocity, uv ).xyz;
    float isStatic = texel.w;
    vec3 result = position + velocity * delta * ( 1.0 - isStatic );
    gl_FragColor = vec4( result.xyz, isStatic );
  }
`;

const fragmentShaderVelocity = `
  uniform float delta;

  vec3 getPosition( vec2 uv ) {
    return texture2D( texturePosition, uv ).xyz;
  }

  vec3 getVelocity( vec2 uv ) {
    return texture2D( textureVelocity, uv ).xyz;
  }

  // int getIndex( vec2 uv ) {
  //   int s = int( size );
  //   int col = int( uv.x * size );
  //   int row = int( uv.y * size );
  //   return col + row * s;
  // }

  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // int id1 = getIndex( uv );
    // vec3 p1 = getPosition( uv );
    vec3 v1 = getVelocity( uv );

    // Calculate Velocity
    vec3 velocity = v1;
    // velocity = clamp( velocity, - maxSpeed, maxSpeed );
    // velocity.z *= 1.0 - is2D;

    gl_FragColor = vec4( velocity, 0.0 );
  }
`;

const fillPositionTexture = (texture) => {
  const theArray = texture.image.data;

  for (let k = 0, kl = theArray.length; k < kl; k += 4) {
    // const x = Math.random() * BOUNDS - BOUNDS_HALF;
    // const y = Math.random() * BOUNDS - BOUNDS_HALF;
    // const z = Math.random() * BOUNDS - BOUNDS_HALF;

    theArray[k + 0] = 0; // x;
    theArray[k + 1] = 0; // y;
    theArray[k + 2] = 0; // z;
    theArray[k + 3] = 0; // 1: static
  }
};

const fillVelocityTexture = (texture) => {
  const theArray = texture.image.data;

  for (let k = 0, kl = theArray.length; k < kl; k += 4) {
    // const x = Math.random() - 0.5;
    // const y = Math.random() - 0.5;
    // const z = Math.random() - 0.5;

    // theArray[k + 0] = x * 10;
    // theArray[k + 1] = y * 10;
    // theArray[k + 2] = z * 10;

    theArray[k + 0] = 10;
    theArray[k + 1] = 0;
    theArray[k + 2] = 0;
    theArray[k + 3] = 1;
  }
};
