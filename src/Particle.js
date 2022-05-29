// ported by markuslerner.com from punktiert Processing library:
// https://github.com/djrkohler/punktiert/tree/master/src/punktiert/physics

import { Vector3 } from './index.js';
import { constrainX, constrainY, constrainZ } from './math/VecUtils.js';

/**
 * An individual 3D particle for use by the VPhysics and VSpring classes. the functionality can be extended by applying different behaviors </p> this class is
 * more or less an modification/ extension of Karsten Schmidt's toxi.physics.VerletPartcle class
 */

export default class Particle extends Vector3 {
  constructor(x = 0.0, y = 0.0, z = 0.0, mass = 1.0, radius = 1.0) {
    super(x, y, z);

    this.velocity = new Vector3();

    this.locked = false;

    this.behaviors = null;
    this.neighbors = null;

    this.mass = mass;
    this.radius = radius;
    this.friction = 0;
    this.maxSpeed = 3.0;

    this.force = new Vector3();

    this.followers = new Set();
  }

  /**
   * Adds the given behavior to the list of behaviors applied to this particle at each step.
   */
  addBehavior(behavior, addEvenIfExists = false) {
    if (this.behaviors === null) {
      this.behaviors = new Set();
    }
    if (!this.behaviors.has(behavior) || addEvenIfExists) {
      this.behaviors.add(behavior);
    }
    return this;
  }

  /**
   * Adds the given constraint to the list of constraints applied to this particle at each step.
   * A constraint is applied always wether the particle is locked or not
   */
  addConstraint(constraint) {
    if (this.behaviors === null) {
      this.behaviors = new Set();
    }
    this.behaviors.add(constraint);
    return this;
  }

  addFollower(vector) {
    this.followers.add(vector);
  }

  addForce(force) {
    this.force.add(force);
    return this;
  }

  applyBehaviors() {
    if (this.behaviors !== null) {
      this.behaviors.forEach((behavior) => {
        behavior.apply(this);
      });
    }
  }

  applyForce(deltaTime) {
    this.velocity.add(
      this.force.multiplyScalar(Math.min(deltaTime, 1) / this.mass)
    );
    this.velocity.limit(this.maxSpeed);
    this.add(this.velocity);

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

  removeBehavior(behavior) {
    if (this.behaviors !== null) {
      const found = this.behaviors.has(behavior);
      this.behaviors.delete(behavior);
      return found;
    } else {
      return false;
    }
  }

  removeFollower(vector) {
    if (this.followers !== null) {
      const found = this.followers.has(vector);
      this.followers.delete(vector);
      return found;
    } else {
      return false;
    }
  }

  scaleVelocity(scale) {
    this.velocity.multiplyScalar(scale);
    return this;
  }

  unlock() {
    this.clearVelocity();
    this.locked = false;
    return this;
  }

  /**
   * applies Behaviors and Force on the particles position. called automatically inherently from the Physics class
   */
  update(deltaTime) {
    if (!this.locked) {
      this.applyBehaviors();
      this.applyForce(deltaTime);
    }
    this.scaleVelocity(1 - this.friction);

    this.followers.forEach((follower) => {
      follower.copy(this);
    });
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
