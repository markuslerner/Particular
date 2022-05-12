import Vector3 from '../math/Vector3.js';
import { limit } from '../math/VecUtils.js';

/**
 * Local Particle Behavior: compares the passed in Particle to its own list of neighbors
 * </p> addBehavior to the VParticle.behaviors; call each timeStep
 * </p> Seek algorythm based on: Craig Reynold's Boids program to simulate the flocking behavior of birds. Here just the rule of Steering. </p> Java
 * implementation Daniel Shiffman (www.shiffman.net)
 */
export default class Seek {
  constructor({
    target = new Vector3(),
    maxSpeed = 3.5,
    maxForce = 0.5,
    slowDownDistance = 100.0,
  }) {
    this.target = target;
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;
    this.slowDownDistance = slowDownDistance;
    this.enabled = true;
  }

  apply(particle) {
    if (this.enabled) {
      const f = this.seek(particle);
      particle.addForce(f);
    }
  }

  seek(particle) {
    const desired = new Vector3().copy(this.target);
    desired.sub(particle);
    const distance = desired.length();

    if (distance > 0) {
      if (distance < this.slowDownDistance) {
        desired.setLength(this.maxSpeed * (distance / this.slowDownDistance));
      } else {
        desired.setLength(this.maxSpeed);
      }

      desired.sub(particle.getVelocity());
      limit(desired, this.maxForce);
    } else {
      desired.set(0, 0, 0);
    }

    return desired;
  }

  setTarget(target) {
    this.target = target;
  }

  setSlowDownDistance(slowDownDistance) {
    this.slowDownDistance = slowDownDistance;
  }
}
