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
    minDistance = 0.0,
    slowDownDistance = 100.0,
    easing = undefined,
  }) {
    this.target = target;
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;
    this.minDistance = minDistance;
    this.slowDownDistance = slowDownDistance;
    this.enabled = true;
    this.easing = easing;
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

    if (distance > this.minDistance) {
      if (distance < this.minDistance + this.slowDownDistance) {
        const k = (distance - this.minDistance) / this.slowDownDistance;
        if (this.easing !== undefined) {
          desired.setLength(this.maxSpeed * this.easing(k));
        } else {
          desired.setLength(this.maxSpeed * k);
        }
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
