// ported by markuslerner.com from punktiert Processing library:
// https://github.com/djrkohler/punktiert/tree/master/src/punktiert/physics

import { Vector3 } from './index.js';
import { constrainX, constrainY, constrainZ } from './math/VecUtils.js';

/**
 * An individual 3D particle for use by the VPhysics and VSpring classes. the functionality can be extended by applying different behaviors </p> this class is
 * more or less an modification/ extension of Karsten Schmidt's toxi.physics.VerletPartcle class
 */

export default class Particle extends Vector3 {
  constructor(x = 0.0, y = 0.0, z = 0.0, w = 1.0, r = 1.0) {
    super(x, y, z);

    this.prev = new Vector3();
    this.prev.set(x, y, z);
    this.temp = new Vector3();
    this.locked = false;

    this.behaviors = null;
    this.neighbors = null;

    this.weight = w;
    this.invWeight = 0;
    this.radius = r;
    this.friction = 0;

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

  addVelocity(v) {
    this.prev.sub(v);
    return this;
  }

  applyBehaviors() {
    if (this.behaviors != null) {
      this.behaviors.forEach((behavior) => {
        behavior.apply(this);
      });
    }
  }

  applyForce(deltaTime) {
    // Java:
    // temp.set(this);
    // addSelf(sub(prev).addSelf(force.mult(weight)));
    // prev.set(temp.copy());
    // force.clear();

    this.temp.copy(this);

    var delta = new Vector3().copy(this);
    delta
      .sub(this.prev)
      .add(this.force.multiplyScalar(this.weight * Math.min(deltaTime, 1)));
    this.add(delta);
    this.prev.copy(this.temp);

    this.force.set(0, 0, 0);
  }

  clearForce() {
    this.force.set(0, 0, 0);
    return this;
  }

  clearVelocity() {
    this.prev.copy(this);
    return this;
  }

  /**
   * @return the inverse weight (1/weight)
   */
  getInvWeight() {
    return this.invWeight;
  }

  /**
   * Returns the particle's position at the most recent time step.
   *
   * @return previous position
   */
  getPreviousPosition() {
    return this.prev;
  }

  getRadius() {
    return this.radius;
  }

  getFriction() {
    return this.friction;
  }

  getVelocity() {
    return new Vector3().copy(this).sub(this.prev);
  }

  /**
   * @return the weight
   */
  getWeight() {
    return this.weight;
  }

  /**
   * @return true, if particle is locked
   */
  isLocked() {
    return this.locked;
  }

  setLocked(locked) {
    this.locked = locked;
    return this;
  }

  /**
   * Locks/immobilizes particle in space
   *
   * @return itself
   */
  lock() {
    this.locked = true;
    return this;
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
    this.prev.lerp(this, 0 + scale);
    return this;
  }

  setNeighbors(neighbors) {
    this.neighbors = new Set(neighbors);
  }

  setPreviousPosition(position) {
    this.prev.copy(position);
    return this;
  }

  setFriction(friction) {
    this.friction = friction;
  }

  setRadius(radius) {
    this.radius = radius;
  }

  setVelocity(vel) {
    // var delta = new Vector3().copy(this);
    // this.prev.copy(delta.sub(vel));

    this.prev.copy(this).sub(vel);
  }

  setWeight(w) {
    this.weight = w;
    this.invWeight = 1 / w;
  }

  /**
   * Unlocks particle again
   *
   * @return itself
   */
  unlock() {
    this.clearVelocity();
    this.locked = false;
    return this;
  }

  /**
   * applies Behaviors and Force on the particles position. called automatically inherent from the Vphysics class
   */
  update(deltaTime) {
    if (!this.locked) {
      this.applyBehaviors();
      this.applyForce(deltaTime);
    }
    this.scaleVelocity(this.friction);

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
