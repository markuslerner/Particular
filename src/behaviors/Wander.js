import { Vector3 } from 'three';
import { limit } from '../VecUtils.js';

// basic wander-algorythm

export default class Wander {
  constructor({ speed = 1.0, maxChange = 1.0, maxForce = 1.0 }) {
    this.speed = speed;
    this.maxChange = maxChange;
    this.maxForce = maxForce;

    this.wanderVelocity = new Vector3();
    this.wanderDirection = new Vector3();
  }

  apply(particle) {
    const f = this.wander(particle);

    particle.addForce(f);
  }

  wander(particle) {
    this.wanderDirection.normalize();
    // wanderDirection.cross(upVector, wanderDirection);

    this.wanderDirection.x += (Math.random() - 0.5) * this.maxChange;
    this.wanderDirection.y += (Math.random() - 0.5) * this.maxChange;
    this.wanderDirection.z += (Math.random() - 0.5) * this.maxChange;

    this.wanderVelocity.set(0, 0, 0);
    this.wanderVelocity.add(this.wanderDirection);

    this.wanderVelocity.multiplyScalar(this.speed);

    limit(this.wanderVelocity, this.maxForce);

    return this.wanderVelocity;
  }

  // apply(particle) {
  //   this.wanderDirection.normalize();
  //   // wanderDirection.cross(upVector, wanderDirection);

  //   this.wanderDirection.x += (Math.random() - 0.5) * this.maxChange;
  //   this.wanderDirection.y += (Math.random() - 0.5) * this.maxChange;
  //   this.wanderDirection.z += (Math.random() - 0.5) * this.maxChange;

  //   this.wanderVelocity.setZero();
  //   this.wanderVelocity.vadd(this.wanderDirection, this.wanderVelocity);

  //   this.wanderVelocity.scale(this.speed, this.wanderVelocity);

  //   VecUtils.limit(this.wanderVelocity, this.maxForce);

  //   // particle.position.vadd(this.wanderVelocity, particle.position);
  //   particle.velocity.vadd(this.wanderVelocity, particle.velocity);

  // }

  toString() {
    return 'Wander';
  }
}
