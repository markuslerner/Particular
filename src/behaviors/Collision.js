import Vector3 from '../math/Vector3.js';
import { limit } from '../math/VecUtils.js';

const delta = new Vector3();

/**
 * Local Particle Behavior: compares the passed in Particle to its own list of
 * neighbors </p> VParticle.neighbors gets automatically updated; selects
 * neighbors in Range: VPhysics.hashGrid.Radius </p> addBehavior to the
 * VParticle.behaviors; call each timeStep
 *
 * </p> Collision Detection based on the VParticle.radius
 */

export default class Collision {
  /**
   * proportional offset of the particle radius for offset (radius*(1-offset))
   */
  constructor({ offset = 0.0, maxForce = 0.2 }) {
    this.offset = offset;
    this.maxForce = maxForce;
    this.enabled = true;
  }

  apply(particle) {
    if (this.enabled) {
      const sum = new Vector3();
      let count = 1;
      const radius =
        this.offset === 0.0
          ? particle.getRadius()
          : particle.getRadius() * (1.0 - this.offset);

      particle.neighbors.forEach((neighbor) => {
        if (neighbor !== particle && !neighbor.noCollision) {
          delta.copy(particle);
          delta.sub(neighbor);

          const dist = delta.length();

          const r = radius + neighbor.getRadius();

          if (dist < r) {
            const force = delta.setLength((r - dist) / r); // multiplyScalar

            sum.add(force);
            count++;
          }
        }
      });

      sum.multiplyScalar(1.0 / count);
      limit(sum, this.maxForce);

      particle.addForce(sum);
    }
  }

  getLimit() {
    return this.limit;
  }

  getOffset() {
    return this.offset;
  }

  setOffset(offset) {
    this.offset = offset;
    return this;
  }

  setLimit(limit) {
    this.limit = limit;
    return this;
  }
}
