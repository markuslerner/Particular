import Vector3 from '../math/Vector3.js';
import { limit } from '../math/VecUtils.js';

const delta = new Vector3();

/**
 * Local Particle Behavior: compares the passed in Particle to its own list of neighbors
 * </p> addBehavior to the VParticle.behaviors;
 * </p> seperation algorythm based on: Craig Reynold's Boids program to simulate the flocking behavior of birds. Here just the rule of seperation. </p> Java
 * implementation Daniel Shiffman (www.shiffman.net); Jose Sanchez (www.plethora-project.com)
 */

export default class Separate {
  constructor({ distance = 25.0, maxSpeed = 3.0, maxForce = 0.05 }) {
    this.distance = distance;
    this.distanceSquared = this.distance * this.distance;
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;
  }

  apply(particle) {
    const f = this.seperate(particle);
    particle.addForce(f);
  }

  seperate(particle) {
    const sep = new Vector3();
    let countSep = 0;

    particle.neighbors.forEach((neighbor) => {
      if (neighbor !== particle) {
        const d = particle.distanceToSquared(neighbor);

        // SEPARATION:
        if (d < this.distanceSquared && d > 0.0) {
          delta.copy(particle);
          delta.sub(neighbor);
          delta.setLength(1.0 / d);
          sep.add(delta);
          countSep++;
        }
        // SEPARATION:
        if (countSep > 0) {
          sep.multiplyScalar(1.0 / countSep);
        }
        if (sep.lengthSq() > 0) {
          // Implement Reynolds: Steering = Desired - Velocity
          sep.setLength(this.maxSpeed);
          sep.sub(particle.getVelocity());
          limit(sep, this.maxForce);
        }
      }
    });

    return sep;
  }

  getDistance() {
    return this.distance;
  }

  setDistance(distance) {
    this.distance = distance;
    this.distanceSquared = this.distance * this.distance;
  }

  getMaxSpeed() {
    return this.maxSpeed;
  }

  setMaxSpeed(maxSpeed) {
    this.maxSpeed = maxSpeed;
  }

  getMaxForce() {
    return this.maxForce;
  }

  setMaxForce(maxForce) {
    this.maxForce = maxForce;
  }
}
