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

  apply(particle, collisionForce = undefined) {
    if (this.enabled) {
      if (collisionForce) {
        this.force.x = collisionForce[0];
        this.force.y = collisionForce[1];
        this.force.z = collisionForce[2];

        limit(this.force, this.maxForce);

        if (this.weight !== 1.0) this.force.multiplyScalar(this.weight);
      } else {
        this.force.set(0, 0, 0);

        let count = 0;
        const radius =
          this.offset === 0.0
            ? particle.radius
            : particle.radius * (1.0 - this.offset);

        for (const neighbor of particle.neighbors) {
          if (neighbor !== particle && !neighbor.noCollision) {
            delta.copy(particle);
            delta.sub(neighbor);

            const dist = delta.length();

            const r = radius + neighbor.radius;

            if (dist < r) {
              delta.setLength((r - dist) / r); // multiplyScalar

              this.force.add(delta);
              count++;
            }
          }
        }

        if (count > 0) {
          this.force.multiplyScalar(1.0 / count);
          limit(this.force, this.maxForce);

          if (this.weight !== 1.0) this.force.multiplyScalar(this.weight);
        }
      }

      particle.addForce(this.force);
    }
  }
}
