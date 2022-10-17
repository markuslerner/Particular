import { GPU } from 'gpu.js';

// const length = gpu
//   .createKernel(function (x, y, z) {
//     return Math.sqrt(x * x + y * y + z * z);
//   })
//   .setOutput([2]);
// console.log(length(2, 2, 2));

// Based on https://stackoverflow.com/questions/68467146/gpu-js-calculating-distance-between-multi-objects-xyz

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

const gpu = new GPU({ mode: 'cpu' }); // { mode: 'cpu' }
gpu.addFunction(distance, {
  // argumentTypes: {
  //   a: 'Array(3)',
  //   b: 'Array(3)',
  // },
  returnType: 'Float',
});

// const kernelMap = gpu.createKernel(
//   function kernelFunction(elems) {
//     return distance(elems[this.thread.x], elems[this.thread.y]);
//   },
//   {
//     dynamicArguments: true,
//     output: [elements.length, elements.length],
//   }
// );

const kernelMap = gpu
  .createKernel(function (e) {
    // let dx = a[0] - b[0];
    // let dy = a[1] - b[1];
    // let dz = a[2] - b[2];

    // let sum = 0;
    // for (let i = 0; i < 512; i++) {
    //   sum += e[this.thread.x][0] * e[this.thread.y][0];
    // }
    // return sum;

    // return e[this.thread.x][0] - e[this.thread.y][0];

    return Math.sqrt(
      (e[this.thread.x][0] - e[this.thread.y][0]) *
        (e[this.thread.x][0] - e[this.thread.y][0]) +
        (e[this.thread.x][1] - e[this.thread.y][1]) *
          (e[this.thread.x][1] - e[this.thread.y][1]) +
        (e[this.thread.x][2] - e[this.thread.y][2]) *
          (e[this.thread.x][2] - e[this.thread.y][2])
    );

    // return x + y; // Math.sqrt(dx * dx + dy * dy + dz * dz);
  })
  .setOutput([elements.length, elements.length]);

// const result = kernelMap(elements);
// console.log(result);

export default class GPUPhysics extends SimplePhysics {
  constructor(props) {
    const {
      buffersize = 1024, // max number of particles
    } = props;
    super(props);

    this.buffersize = 2000;

    this.calculateDistanceMap = gpu.createKernel(
      function kernelFunction(e) {
        return distance(e[this.thread.x], e[this.thread.y]);

        // return Math.sqrt(
        //   (e[this.thread.x][0] - e[this.thread.y][0]) *
        //     (e[this.thread.x][0] - e[this.thread.y][0]) +
        //     (e[this.thread.x][1] - e[this.thread.y][1]) *
        //       (e[this.thread.x][1] - e[this.thread.y][1]) +
        //     (e[this.thread.x][2] - e[this.thread.y][2]) *
        //       (e[this.thread.x][2] - e[this.thread.y][2])
        // );
      },
      {
        dynamicArguments: true,
        output: [this.buffersize, this.buffersize],
      }
    );
  }

  updateParticles(deltaTime) {
    // if (!this.distanceMap) {
    //   this.distanceMap = [];
    //   for (let i = 0; i < this.particles.size; i++) {
    //     const a = [];
    //     this.distanceMap.push(a);
    //     for (let j = 0; j < this.particles.size; j++) {
    //       a.push(0);
    //     }
    //   }
    // }
    //
    // let index = 0;
    // for (const particle of this.particles) {
    //   let index2 = 0;
    //   for (const particle2 of this.particles) {
    //     if (particle2 !== particle && !particle2.noCollision) {
    //       this.distanceMap[index][index2] = particle.distanceTo(particle2);
    //     }
    //     index2++;
    //   }
    //   index++;
    // }
    const particles = [...this.particles].map((p) => [p.x, p.y, p.z]);
    // console.log(particles.length);
    const distanceMap = this.calculateDistanceMap(particles);
    // console.log(d);
    super.updateParticles(deltaTime, distanceMap);
  }
}
