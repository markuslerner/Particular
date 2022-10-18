import { GPU } from 'gpu.js';

// Based on https://stackoverflow.com/questions/68467146/gpu-js-calculating-distance-between-multi-objects-xyz

import SimplePhysics from './SimplePhysics.js';

function distance(x1, y1, z1, x2, y2, z2) {
  let dx = x1 - x2;
  let dy = y1 - y2;
  let dz = z1 - z2;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function setLength(x, y, z, l) {
  const s = Math.sqrt(x * x + y * y + z * z);
  if (s === 0) return [x, y, z];
  return [(x / s) * l, (y / s) * l, (z / s) * l];
}

export default class GPUPhysics extends SimplePhysics {
  constructor(props) {
    super(props);

    this.gpu = new GPU(); // { mode: 'cpu' }

    this.gpu.addFunction(distance, {
      argumentTypes: {
        x1: 'Number',
        y1: 'Number',
        z1: 'Number',
        x2: 'Number',
        y2: 'Number',
        z2: 'Number',
      },
      returnType: 'Float',
    });

    this.gpu.addFunction(setLength, {
      argumentTypes: {
        x: 'Number',
        y: 'Number',
        z: 'Number',
        l: 'Number',
      },
      returnType: 'Array(3)',
    });
  }

  updateParticles(deltaTime) {
    if (
      !this.particlesCountMaxLast ||
      this.particlesCountMaxLast < this.particles.size
    ) {
      // console.log('DEBUG: Create collision force kernel function');

      this.calculateCollisionForce = this.gpu.createKernel(
        function kernelFunction(e, size) {
          // return distance(e[this.thread.x], e[this.thread.y]);

          let x = 0;
          let y = 0;
          let z = 0;
          let count = 0;

          for (let j = 0; j < size; j++) {
            // sum += a[this.thread.y][i] * b[i][this.thread.x];

            const dist = distance(
              e[this.thread.x][0],
              e[this.thread.x][1],
              e[this.thread.x][2],
              e[j][0],
              e[j][1],
              e[j][2]
            );

            // // const r = p1.radius + p2.radius;
            const r = 1;

            if (dist < r && dist > 0) {
              const delta = [
                e[this.thread.x][0] - e[j][0],
                e[this.thread.x][1] - e[j][1],
                e[this.thread.x][2] - e[j][2],
              ];

              const d = setLength(delta[0], delta[1], delta[2], (r - dist) / r);

              x += d[0];
              y += d[1];
              z += d[2];

              count++;
            }
          }

          if (count > 0) {
            x /= count;
            y /= count;
            z /= count;

            return [x, y, z];
          }

          return [x, y, z];
        },
        {
          // constants: { size: this.particles.size },
          // dynamicArguments: true,
          output: [this.particles.size],
          precision: 'single',
          // optimizeFloatMemory: true,
          tactic: 'speed',
          argumentTypes: { e: 'Array', size: 'Integer' },
          loopMaxIterations: this.particles.size,
        }
      );

      this.particlesCountMaxLast = this.particles.size;
    }

    const particles = [...this.particles].map((p) => [p.x, p.y, p.z]);

    // const start = performance.now();

    const collisionForces =
      particles.length > 0
        ? this.calculateCollisionForce(particles, particles.length)
        : undefined;
    // console.log(collisionForces);

    // const end = performance.now();
    // console.log(end - start);

    super.updateParticles(deltaTime, collisionForces);

    // super.updateParticles(deltaTime);
  }
}
