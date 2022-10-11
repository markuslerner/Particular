import Vector3 from '../math/Vector3.js';
import { limit } from '../math/VecUtils.js';

const delta = new Vector3();

/**
 * Local Particle Behavior: compares the passed in Particle to its own list of neighbors
 * Seperation algorythm based on: Craig Reynold's Boids program to simulate the flocking behavior of birds. Here just the rule of seperation.
 */

export default class Separate {
  constructor({ distance = 25.0, maxSpeed = 3.0, maxForce = 0.05 } = {}) {
    this.distance = distance;
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;
    this.enabled = true;
    this.weight = 1.0;
  }

  apply(particle) {
    if (this.enabled) {
      const f = this.seperate(particle);
      particle.addForce(f);
    }
  }

  seperate(particle) {
    const sep = new Vector3();
    let count = 0;

    for (let i = 0; i < particle.neighbors.length; i++) {
      const neighbor = particle.neighbors[i];

      if (neighbor !== particle) {
        const d = particle.distanceTo(neighbor);

        if (d > 0.0 && d < this.distance) {
          delta.copy(particle);
          delta.sub(neighbor);
          delta.setLength(1.0 / d);
          sep.add(delta);
          count++;
        }
      }
    }

    if (count > 0) {
      sep.multiplyScalar(1.0 / count);
    }
    if (sep.lengthSq() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      sep.setLength(this.maxSpeed);
      sep.sub(particle.getVelocity());
      limit(sep, this.maxForce);
    }

    if (this.weight !== 1.0) sep.multiplyScalar(this.weight);

    return sep;
  }
}
