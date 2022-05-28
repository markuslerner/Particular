import Vector3 from '../math/Vector3.js';
import { limit } from '../math/VecUtils.js';

const sum = new Vector3();
const desired = new Vector3();
const steer = new Vector3();

/**
 * Local Particle Behavior: compares the passed in Particle to its own list of neighbors
 *
 * </p> cohesion algorythm based on: Craig Reynold's Boids program to simulate the flocking behavior of birds. Here just the rule of coherence. </p> Java
 * implementation Daniel Shiffman (www.shiffman.net); Jose Sanchez (www.plethora-project.com)
 *
 */
export default class Cohesion {
  constructor({ distance = 50, maxSpeed = 3.0, maxForce = 0.05 } = {}) {
    this.distance = distance;
    this.distanceSquared = this.distance * this.distance;
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;
    this.enabled = true;
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
    particle.neighbors.forEach((neighbor) => {
      if (neighbor !== particle) {
        const d = particle.distanceToSquared(neighbor);
        if (d > 0 && d < this.distanceSquared) {
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
    const m = 10;
    if (desired.length() < m) {
      desired.multiplyScalar(this.maxSpeed * (desired.length() / m));
    } else {
      desired.multiplyScalar(this.maxSpeed);
    }
    steer.copy(desired).sub(particle.getVelocity());
    limit(steer, this.maxForce);

    return steer;
  }

  getDistance() {
    return this.distance;
  }

  setDistance(distance) {
    this.distance = distance;
    this.distanceSquared = this.distance * this.distance;
  }
}
