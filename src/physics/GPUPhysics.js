import { GPU } from 'gpu.js';

import SimplePhysics from './SimplePhysics.js';

function add(x1, y1, z1, x2, y2, z2) {
  return [x1 + x2, y1 + y2, z1 + z2];
}

function sub(x1, y1, z1, x2, y2, z2) {
  return [x1 - x2, y1 - y2, z1 - z2];
}

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

    this.useGPU = true;

    this.gpu = new GPU(); // { mode: 'cpu' }

    this.gpu.addFunction(add, {
      argumentTypes: {
        x1: 'Number',
        y1: 'Number',
        z1: 'Number',
        x2: 'Number',
        y2: 'Number',
        z2: 'Number',
      },
      returnType: 'Array(3)',
    });

    this.gpu.addFunction(sub, {
      argumentTypes: {
        x1: 'Number',
        y1: 'Number',
        z1: 'Number',
        x2: 'Number',
        y2: 'Number',
        z2: 'Number',
      },
      returnType: 'Array(3)',
    });

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
      this.useGPU &&
      (!this.particlesCountMaxLast ||
        this.particlesCountMaxLast < this.particles.size)
    ) {
      // console.log(
      //   'DEBUG: Create collision force kernel function for ' +
      //     this.particles.size +
      //     ' particles'
      // );

      this.calculateCollisionForce = this.gpu.createKernel(
        function kernelFunction(e, size) {
          let x = 0;
          let y = 0;
          let z = 0;
          let count = 0;

          for (let j = 0; j < size; j++) {
            const dist = distance(
              e[this.thread.x][0],
              e[this.thread.x][1],
              e[this.thread.x][2],
              e[j][0],
              e[j][1],
              e[j][2]
            );

            const r = e[this.thread.x][3] + e[j][3];

            if (dist < r && dist > 0) {
              const delta = sub(
                e[this.thread.x][0],
                e[this.thread.x][1],
                e[this.thread.x][2],
                e[j][0],
                e[j][1],
                e[j][2]
              );

              const d = setLength(delta[0], delta[1], delta[2], (r - dist) / r);

              x += d[0];
              y += d[1];
              z += d[2];

              count++;
            }
          }

          if (count > 0) {
            return [x / count, y / count, z / count];
          } else {
            return [x, y, z];
          }
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

    if (this.useGPU) {
      const particles = [...this.particles].map((p) => [
        p.x,
        p.y,
        p.z,
        p.radius,
      ]);

      // const start = performance.now();

      const collision =
        particles.length > 0
          ? this.calculateCollisionForce(particles, particles.length)
          : undefined;
      // console.log(collisionForces);

      // const end = performance.now();
      // console.log(end - start);

      let index = 0;

      for (const particle of this.particles) {
        if (particle.neighbors === null) {
          particle.neighbors = this.particles;
        }

        const forces = { collision: collision[index] };

        for (const behavior of this.behaviors) {
          behavior.apply(particle, forces);
        }

        particle.scaleVelocity(1 - this.friction);
        particle.update(deltaTime, forces);

        index++;
      }
    } else {
      super.updateParticles(deltaTime);
    }
  }
}
