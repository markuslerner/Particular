import { GPU } from 'gpu.js';

// const length = gpu
//   .createKernel(function (x, y, z) {
//     return Math.sqrt(x * x + y * y + z * z);
//   })
//   .setOutput([2]);
// console.log(length(2, 2, 2));

import SimplePhysics from './SimplePhysics.js';

function distance(a, b) {
  let dx = a[0] - b[0];
  let dy = a[1] - b[1];
  let dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
let elements = [
  [1, 1, 0],
  [2, 2, 2],
  [3, 3, 3],
  [4, 4, 4],
  // ... 100k elements
];

const gpu = new GPU({ mode: 'cpu' });
gpu.addFunction(distance, {
  argumentTypes: {
    a: 'Array(3)',
    b: 'Array(3)',
  },
  returnType: 'Float',
});

const kernelMap = gpu.createKernel(
  function kernelFunction(elems) {
    return distance(elems[this.thread.x], elems[this.thread.y]);
  },
  {
    dynamicArguments: true,
    output: [elements.length, elements.length],
  }
);

const result = kernelMap(elements);

console.log(result);

export default class GPUPhysics extends SimplePhysics {
  constructor(props) {
    const {
      buffersize = 1024, // max number of particles, needs to be power of 2
    } = props;
    super(props);

    this.buffersize = buffersize;

    // const calculateDistances = gpu
    //   .createKernel(function (a, b) {
    //     // let sum = 0;
    //     // for (let i = 0; i < buffersize; i++) {
    //     //   sum += a[this.thread.y][i] * b[i][this.thread.x];
    //     // }
    //
    //     return a[this.thread.y] + '_' + b[this.thread.x];
    //   })
    //   .setOutput([buffersize, buffersize]);

    // calculateDistances
  }

  updateParticles(deltaTime) {
    super.updateParticles(deltaTime);
  }
}
