import Vector3 from '../math/Vector3.js';
import { limit } from '../math/VecUtils.js';

/**
 * Local Particle Behavior: compares the passed in Particle to its own list of neighbors
 * Seek algorythm based on: Craig Reynold's Boids program to simulate the flocking behavior of birds
 */
export default class Seek extends EventTarget {
  constructor({
    target = new Vector3(),
    maxSpeed = 3.5,
    maxForce = 0.5,
    minDistance = 0.0,
    slowDownDistance = 100.0,
    easing = undefined,
    arriveEnabled = false,
    arriveDistance = 0.01,
  } = {}) {
    super();

    this.target = target;
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;
    this.minDistance = minDistance;
    this.slowDownDistance = slowDownDistance;
    this.easing = easing;
    this.arriveEnabled = arriveEnabled;
    this.arriveDistance = arriveDistance;
    this.enabled = true;
    this.arrived = false;
    this.weight = 1.0;
    this.seekStarted = false;
  }

  apply(particle) {
    if (this.enabled) {
      const f = this.seek(particle);
      particle.addForce(f);
    }
  }

  seek(particle) {
    const desired = new Vector3().copy(this.target).sub(particle);
    const distance = desired.length();

    if (distance > this.minDistance) {
      if (distance < this.minDistance + this.slowDownDistance) {
        const k = (distance - this.minDistance) / this.slowDownDistance;
        if (this.easing !== undefined && this.easing !== null) {
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

    if (this.arriveEnabled) {
      const arrived = distance < this.arriveDistance;
      if (!arrived && (this.arrived || !this.seekStarted)) {
        this.dispatchEvent(new Event('start'));
        this.seekStarted = true;
      }

      if (arrived && !this.arrived) {
        this.dispatchEvent(new Event('arrive'));
      }

      this.arrived = arrived;
    }

    if (this.weight !== 1.0) desired.multiplyScalar(this.weight);

    return desired;
  }
}
