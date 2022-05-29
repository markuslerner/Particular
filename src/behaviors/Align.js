import Vector3 from '../math/Vector3.js';
import { limit } from '../math/VecUtils.js';

const ali = new Vector3();

/**
 * Local Particle Behavior: compares the passed in Particle to its own list of neighbors
 * </p> addBehavior to the VParticle.behaviors;
 * </p> Alignment algorythm based on: Craig Reynold's Boids program to simulate the flocking behavior of birds. Here just the rule of Alignment. </p> Java
 * implementation Daniel Shiffman (www.shiffman.net); Jose Sanchez (www.plethora-project.com)
 */
export default class Align {
  constructor({ distance = 50, maxSpeed = 3.0, maxForce = 0.05 } = {}) {
    this.distance = distance;
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;
    this.enabled = true;
    this.weight = 1.0;
  }

  apply(particle) {
    if (this.enabled) {
      const f = this.align(particle);
      particle.addForce(f);
    }
  }

  align(particle) {
    ali.set(0, 0, 0);
    let count = 0;

    const distanceSquared = this.distance * this.distance;

    particle.neighbors.forEach((neighbor) => {
      if (neighbor !== particle) {
        const d = particle.distanceToSquared(neighbor);

        if (d > 0 && d < distanceSquared) {
          ali.add(neighbor.getVelocity());
          count++;
        }
      }
    });

    if (count > 0) {
      ali.multiplyScalar(1.0 / count);
    }

    if (ali.lengthSq() > 0) {
      ali.setLength(this.maxSpeed);
      ali.sub(particle.getVelocity());
      limit(ali, this.maxForce);
    }

    ali.multiplyScalar(this.weight);

    return ali;
  }
}
