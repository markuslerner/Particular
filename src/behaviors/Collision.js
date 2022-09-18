import Vector3 from '../math/Vector3.js';
import { limit } from '../math/VecUtils.js';

const delta = new Vector3();

/**
 * Collision avoidance: selects neighbors within each others radius
 */

export default class Collision {
  /**
   * proportional offset of the particle radius for offset (radius*(1-offset))
   */
  constructor({ offset = 0.0, maxForce = 0.2 } = {}) {
    this.offset = offset;
    this.maxForce = maxForce;
    this.enabled = true;
    this.weight = 1.0;
    this.force = new Vector3();
  }

  apply(particle) {
    if (this.enabled) {
      if (particle.updateCollisionForce) {
        this.force.set(0, 0, 0);

        let count = 1;
        const radius =
          this.offset === 0.0
            ? particle.radius
            : particle.radius * (1.0 - this.offset);

        particle.neighbors.forEach((neighbor) => {
          if (neighbor !== particle && !neighbor.noCollision) {
            delta.copy(particle);
            delta.sub(neighbor);

            const dist = delta.length();

            const r = radius + neighbor.radius;

            if (dist < r) {
              const force = delta.setLength((r - dist) / r); // multiplyScalar

              this.force.add(force);
              count++;
            }
          }
        });

        this.force.multiplyScalar(1.0 / count);
        limit(this.force, this.maxForce);

        if (this.weight !== 1.0) this.force.multiplyScalar(this.weight);
      }

      particle.addForce(this.force);
    }
  }
}
