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

function setLength(v, l) {
  const s = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  if (s === 0) return v;
  return [(v[0] / s) * l, (v[1] / s) * l, (v[2] / s) * l];
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

const gpu = new GPU({ mode: 'cpu' }); // { mode: 'cpu' }
gpu.addFunction(distance, {
  argumentTypes: {
    a: 'Array(3)',
    b: 'Array(3)',
  },
  returnType: 'Float',
});

gpu.addFunction(setLength, {
  argumentTypes: {
    v: 'Array(3)',
    l: 'Float',
  },
  returnType: 'Array(3)',
});

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

    this.buffersize = 2000;

    // this.calculateDistanceMap = gpu.createKernel(
    //   function kernelFunction(e) {
    //     // return distance(e[this.thread.x], e[this.thread.y]);
    //
    //     const i = this.thread.x * 3;
    //     const j = this.thread.y * 3;
    //
    //     return distance2(
    //       e[i],
    //       e[i + 1],
    //       e[i + 2],
    //
    //       e[j],
    //       e[j + 1],
    //       e[j + 2]
    //     );
    //   },
    //   {
    //     // dynamicArguments: true,
    //     output: [this.buffersize, this.buffersize],
    //     precision: 'single',
    //     optimizeFloatMemory: true,
    //     tactic: 'speed',
    //   }
    // );

    this.calculateCollisionForce = gpu.createKernel(
      function kernelFunction(e) {
        // return distance(e[this.thread.x], e[this.thread.y]);

        const force = [0, 0, 0];
        const i = this.thread.x;
        const p1 = e[i];
        let count = 0;

        for (let j = 0; j < 2000; j++) {
          // sum += a[this.thread.y][i] * b[i][this.thread.x];
          const p2 = e[j];

          const dist = distance(p1, p2);

          // const deltaX = p1[0] - p2[0];
          // const deltaY = p1[1] - p2[1];
          // const deltaZ = p1[2] - p2[2];

          // const r = p1.radius + p2.radius;
          const r = 1;

          if (dist < r && dist > 0) {
            const delta = [p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]];

            const d = setLength(delta, (r - dist) / r); // multiplyScalar

            force[0] += d[0];
            force[1] += d[1];
            force[2] += d[2];

            count++;
          }
        }

        if (count > 0) {
          force[0] /= count;
          force[1] /= count;
          force[2] /= count;
        }

        return force;
      },
      {
        // dynamicArguments: true,
        output: [this.buffersize],
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

    // const start = performance.now();
    // const end = performance.now();
    // console.log(end - start);

    const particles = [...this.particles].map((p) => [p.x, p.y, p.z]);

    // const positions = [...this.particles].reduce((accumulator, p) => {
    //   accumulator.push(p.x);
    //   accumulator.push(p.y);
    //   accumulator.push(p.z);
    //   return accumulator;
    // }, []);

    // console.log(particles.length);
    // const distanceMap = this.calculateDistanceMap(particles);
    // console.log(distanceMap);

    // const distanceMap = this.calculateDistanceMap(positions);
    // console.log(distanceMap);

    this.collisionBatchSize = 0;

    const forceMap = this.calculateCollisionForce(particles);
    // console.log(forceMap);

    super.updateParticles(deltaTime, forceMap);
    // super.updateParticles(deltaTime);
  }
}
