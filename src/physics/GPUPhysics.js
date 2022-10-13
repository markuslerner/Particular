import { GPU } from 'gpu.js';
const gpu = new GPU();

// const sqrt = gpu
//   .createKernel(function (a) {
//     return Math.sqrt(a);
//   })
//   .setOutput([1]);

const length = gpu
  .createKernel(function (x, y, z) {
    return Math.sqrt(x * x + y * y + z * z);
  })
  .setOutput([2]);
console.log(length(2, 2, 2));

import SimplePhysics from './SimplePhysics.js';

export default class GPUPhysics extends SimplePhysics {
  constructor(props) {
    const {
      buffersize = 1024, // max number of particles, needs to be power of 2
    } = props;
    super(props);

    this.buffersize = buffersize;
  }

  updateParticles(deltaTime) {
    super.updateParticles(deltaTime);
  }
}
