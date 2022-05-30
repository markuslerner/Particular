import Vector3 from '../math/Vector3.js';
import { limit } from '../math/VecUtils.js';

const sum = new Vector3();
const desired = new Vector3();
const steer = new Vector3();

/**
 * Local Particle Behavior: compares the passed in Particle to its own list of neighbors
 * Cohesion algorythm based on: Craig Reynold's Boids program to simulate the flocking behavior of birds. Here just the rule of coherence. </p> Java
 */
export default class Cohesion {
  constructor({ distance = 50, maxSpeed = 3.0, maxForce = 0.05 } = {}) {
    this.distance = distance;
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;
    this.enabled = true;
    this.weight = 1.0;
  }

  apply(particle) {
    if (this.enabled) {
      const f = this.cohesion(particle);
      particle.addForce(f);
    }
  }

  cohesion(particle) {
    sum.set(0, 0, 0);

    let count = 0;

    const distanceSquared = this.distance * this.distance;

    particle.neighbors.forEach((neighbor) => {
      if (neighbor !== particle) {
        const d = particle.distanceToSquared(neighbor);
        if (d > 0 && d < distanceSquared) {
          sum.add(neighbor);
          count++;
        }
      }
    });
    if (count > 0) {
      sum.multiplyScalar(1.0 / count);
      return this.seek(sum, particle);
    }

    return sum;
  }

  seek(target, particle) {
    desired.copy(target).sub(particle);
    desired.setLength(this.maxSpeed);
    steer.copy(desired).sub(particle.getVelocity());
    limit(steer, this.maxForce);

    if (this.weight !== 1.0) steer.multiplyScalar(this.weight);

    return steer;
  }
}
