import { Vector3 } from './index.js';
import { constrainX, constrainY, constrainZ } from './math/VecUtils.js';

/**
 * An individual 3D particle for use by the Physics and Spring classes. The functionality can be extended by applying different behaviors
 * This class is based on of Karsten Schmidt's toxi.physics.VerletPartcle class
 */

export default class Particle extends Vector3 {
  constructor(x = 0.0, y = 0.0, z = 0.0, mass = 1.0, radius = 1.0) {
    super(x, y, z);

    this.locked = false;

    this.behaviors = null;
    this.neighbors = null;
    this.followers = null;

    this.mass = mass;
    this.radius = radius;
    this.friction = 0;
    this.maxSpeed = 3.0;

    this.force = new Vector3();
    this.velocity = new Vector3();
    this.velocitySmooth = new Vector3();
  }

  addBehavior(behavior, addEvenIfExists = false) {
    if (this.behaviors === null) {
      this.behaviors = [];
    }
    if (!this.behaviors.includes(behavior) || addEvenIfExists) {
      this.behaviors.push(behavior);
    }
    return this;
  }

  getBehavior(behaviorClass) {
    if (this.behaviors !== null) {
      for (const behavior of this.behaviors) {
        if (behavior instanceof behaviorClass) {
          return behavior;
        }
      }
    }
    return null;
  }

  addFollower(vector) {
    if (this.followers === null) {
      this.followers = [];
    }

    this.followers.push(vector);
  }

  addForce(force) {
    this.force.add(force);
    return this;
  }

  applyBehaviors() {
    if (this.behaviors !== null) {
      for (let i = 0; i < this.behaviors.length; i++) {
        const behavior = this.behaviors[i];

        behavior.apply(this);
      }
    }
  }

  applyForce(deltaTime) {
    this.velocity.add(
      this.force.multiplyScalar(Math.min(deltaTime, 1) / this.mass)
    );
    this.velocity.limit(this.maxSpeed);
    this.add(this.velocity);

    this.velocitySmooth.lerp(this.velocity, 0.05);

    this.force.set(0, 0, 0);
  }

  clearForce() {
    this.force.set(0, 0, 0);
    return this;
  }

  clearVelocity() {
    this.velocity.set(0, 0, 0);
    return this;
  }

  getVelocity() {
    return this.velocity;
  }

  scaleVelocity(scale) {
    this.velocity.multiplyScalar(scale);
    return this;
  }

  removeBehavior(behavior) {
    if (this.behaviors !== null) {
      const found = this.behaviors.includes(behavior);
      this.behaviors = this.behaviors.filter((b) => b !== behavior);
      return found;
    } else {
      return false;
    }
  }

  removeFollower(follower) {
    if (this.followers !== null) {
      const found = this.followers.includes(follower);
      this.followers = this.followers.filter((f) => f !== follower);
      return found;
    } else {
      return false;
    }
  }

  unlock() {
    this.clearVelocity();
    this.locked = false;
    return this;
  }

  update(deltaTime) {
    if (!this.locked) {
      this.applyBehaviors();
      this.applyForce(deltaTime);
    }
    this.scaleVelocity(1 - this.friction);

    if (this.followers !== null) {
      for (let i = 0; i < this.followers.length; i++) {
        const follower = this.followers[i];

        follower.copy(this);
      }
    }
  }

  equalsWithTolerance(v, tolerance) {
    let diff = this.x - v.x;
    if (isNaN(diff)) {
      return false;
    }
    if ((diff < 0 ? -diff : diff) > tolerance) {
      return false;
    }
    diff = this.y - v.y;
    if (isNaN(diff)) {
      return false;
    }
    if ((diff < 0 ? -diff : diff) > tolerance) {
      return false;
    }
    diff = this.z - v.z;
    if (isNaN(diff)) {
      return false;
    }
    if ((diff < 0 ? -diff : diff) > tolerance) {
      return false;
    }
    return true;
  }

  constrainX(min, max) {
    constrainX(this, min, max);
  }

  constrainY(min, max) {
    constrainY(this, min, max);
  }

  constrainZ(min, max) {
    constrainZ(this, min, max);
  }
}
