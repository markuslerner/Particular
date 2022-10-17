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
function distance2(x1, y1, z1, x2, y2, z2) {
  let dx = x1 - x2;
  let dy = y1 - y2;
  let dz = z1 - z2;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
let elements = [
  [1, 1, 0],
  [2, 2, 2],
  [3, 3, 3],
  [4, 4, 4],
  // ... 100k elements
];

const gpu = new GPU({ mode: 'gpu' }); // { mode: 'cpu' }
// gpu.addFunction(distance, {
//   argumentTypes: {
//     a: 'Array(3)',
//     b: 'Array(3)',
//   },
//   returnType: 'Float',
// });

gpu.addFunction(distance2, {
  // argumentTypes: {
  //   a: 'Array(3)',
  //   b: 'Array(3)',
  // },
  returnType: 'Float',
});

// const kernel = gpu.createKernel(
//   function kernelFunction(elems) {
//     return distance(elems[this.thread.x], elems[this.thread.y]);
//   },
//   {
//     dynamicArguments: true,
//     output: [elements.length, elements.length],
//   }
// );

// const kernel = gpu
//   .createKernel(function (e) {
//     // let dx = a[0] - b[0];
//     // let dy = a[1] - b[1];
//     // let dz = a[2] - b[2];
//
//     // let sum = 0;
//     // for (let i = 0; i < 512; i++) {
//     //   sum += e[this.thread.x][0] * e[this.thread.y][0];
//     // }
//     // return sum;
//
//     // return e[this.thread.x][0] - e[this.thread.y][0];
//
//     return Math.sqrt(
//       (e[this.thread.x][0] - e[this.thread.y][0]) *
//         (e[this.thread.x][0] - e[this.thread.y][0]) +
//         (e[this.thread.x][1] - e[this.thread.y][1]) *
//           (e[this.thread.x][1] - e[this.thread.y][1]) +
//         (e[this.thread.x][2] - e[this.thread.y][2]) *
//           (e[this.thread.x][2] - e[this.thread.y][2])
//     );
//
//     // return x + y; // Math.sqrt(dx * dx + dy * dy + dz * dz);
//   })
//   .setOutput([elements.length, elements.length]);

// const result = kernel(elements);
// console.log(result);

export default class GPUPhysics extends SimplePhysics {
  constructor(props) {
    const {
      buffersize = 1024, // max number of particles
    } = props;
    super(props);

    this.buffersize = 1000;

    this.calculateDistanceMap = gpu.createKernel(
      function kernelFunction(e) {
        return distance2(
          e[this.thread.x][0],
          e[this.thread.x][1],
          e[this.thread.x][2],

          e[this.thread.y][0],
          e[this.thread.y][1],
          e[this.thread.y][2]
        );

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
        // dynamicArguments: true,
        output: [this.buffersize, this.buffersize],
        precision: 'single',
        optimizeFloatMemory: true,
        tactic: 'speed',
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
    // }+

    const particles = [...this.particles].map((p) => [p.x, p.y, p.z]);
    // console.log(particles.length);
    const distanceMap = this.calculateDistanceMap(particles);
    // console.log(distanceMap);
    super.updateParticles(deltaTime, distanceMap);
  }
}
