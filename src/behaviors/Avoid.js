import Vector3 from '../math/Vector3.js';
import { limit } from '../VecUtils.js';

export default class Avoid {
  constructor({
    target = new Vector3(),
    maxSpeed = 3.5,
    maxForce = 0.5,
    maxDistance = 100.0,
  }) {
    this.target = target;
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;

    this.maxDistance = maxDistance;
  }

  apply(particle) {
    const f = this.seek(particle);

    particle.addForce(f);
  }

  seek(particle) {
    const desired = new Vector3().copy(particle);
    desired.sub(this.target);
    const distance = desired.length();

    if (distance < this.maxDistance) {
      desired.setLength(this.maxSpeed * (1 - distance / this.maxDistance));
    } else {
      desired.set(0, 0, 0);
    }

    desired.sub(particle.getVelocity());
    limit(desired, this.maxForce);

    return desired;
  }

  setTarget(target) {
    this.target = target;
  }

  setMaxDistance(maxDistance) {
    this.maxDistance = maxDistance;
  }
}
