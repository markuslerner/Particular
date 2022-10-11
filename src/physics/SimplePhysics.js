/**
 * particle physics engine using Verlet integration </p> based on:
 * http://en.wikipedia.org/wiki/Verlet_integration
 * http://www.teknikus.dk/tj/gdc2001.htm </p> this class is more or less a
 * modification/extension of Karsten Schmidt's toxi.physics.VerletPhysics
 * class, http://toxiclibs.org ; </p> for convenience combined physics for 2D /
 * 3D; some addons for speed; and extended behaviors </p> Written by Daniel
 * Koehler - 2012 www.lab-eds.org
 */
export default class SimplePhysics {
  constructor({
    friction = 0.95,
    springIterationsCount = 50,
    collisionBatchSize = Infinity,
  } = {}) {
    this.behaviors = [];
    this.constraints = [];
    this.groups = [];
    this.particles = [];
    this.springs = [];

    this.collisionBatchSize = collisionBatchSize;
    this.friction = friction;
    this.springIterationsCount = springIterationsCount;

    this.collisionStartIndex = 0;
  }

  /**
   * Adds a behavior to the list
   *
   * @param behavior
   */
  addBehavior(behavior) {
    this.behaviors.push(behavior);
  }

  /**
   * Adds a particle to the list
   *
   * @param p
   * @return itself
   */
  addParticle(particle) {
    return this.returnIfConstrained(particle);
  }

  /**
   * Adds a spring to the list
   *
   * @param s
   * @return itself
   */
  addSpring(s) {
    if (this.getSpring(s.a, s.b) === null) {
      this.springs.push(s);
    }
    return this;
  }

  addConstraint(constraint) {
    this.constraints.push(constraint);
    return this;
  }

  /**
   * Adds a group (or String) to the List without affecting the global
   * particle calculation
   *
   * @param g
   *            VParticleGroup
   */
  addGroup(g) {
    this.groups.push(g);
    return this;
  }

  clear() {
    this.particles = [];
    this.springs = [];
    return this;
  }

  getParticle(particle) {
    return this.returnIfConstrained(particle);
  }

  /**
   * Attempts to find the spring element between the 2 particles supplied
   *
   * @param a
   *            particle 1
   * @param b
   *            particle 2
   * @return spring instance, or null if not found
   */
  getSpring(a, b) {
    for (const s of this.springs) {
      if ((s.a === a && s.b === b) || (s.a === b && s.b === a)) {
        return s;
      }
    }
    return null;
  }

  /**
   * get the count of how many springs are connected to A
   *
   * @param spring
   *            particle 1
   */
  getnumConnected(spring) {
    let count = 0;
    for (const s of this.springs) {
      if (s.a === spring || s.b === spring) {
        count++;
      }
    }
    return count;
  }

  hasBehavior(behavior) {
    return this.behaviors.has(behavior);
  }

  hasConstraint(constraint) {
    return this.constraints.includes(constraint);
  }

  hasGroup(group) {
    return this.groups.includes(group);
  }

  hasParticle(particle) {
    return this.particles.includes(particle);
  }

  hasSpring(spring) {
    return this.springs.includes(spring);
  }

  /**
   * Removes a behavior from the simulation.
   *
   * @param behavior
   *            behavior to remove
   * @return true, if removed successfully
   */
  removeBehavior(behavior) {
    const found = this.behaviors.includes(behavior);
    this.behaviors = this.behaviors.filter((b) => b !== behavior);
    return found;
  }

  /**
   * Removes a constraint from the simulation.
   */
  removeConstraint(constraint) {
    const found = this.constraints.includes(constraint);
    this.constraints = this.constraints.filter((c) => c !== constraint);
    return found;
  }

  /**
   * Removes a particle from the simulation.
   *
   * @param particle
   *            particle to remove
   * @return true, if removed successfully
   */
  removeParticle(particle) {
    const found = this.particles.includes(particle);
    this.particles.filter((p) => p !== particle);
    return found;
  }

  /**
   * Removes a spring connector from the simulation instance.
   *
   * @param spring
   *            spring to remove
   * @return true, if the spring has been removed
   */
  removeSpring(spring) {
    const found = this.springs.includes(spring);
    this.springs.filter((s) => s !== spring);
    return found;
  }

  /**
   * Removes a spring connector and its both end point particles from the
   * simulation
   *
   * @param spring
   *            spring to remove
   * @return true, only if spring AND particles have been removed successfully
   */
  removeSpringElements(spring) {
    if (this.removeSpring(spring)) {
      return this.removeParticle(spring.a) && this.removeParticle(spring.b);
    }
    return false;
  }

  /**
   * Removes a particle group from the simulation instance.
   *
   * @param group
   *            to remove
   * @return true, if the group has been removed
   */
  removeGroup(group) {
    const found = this.groups.includes(group);
    this.groups.filter((g) => g !== group);
    return found;
  }

  /**
   * Updates all particle positions
   */
  updateParticles(deltaTime) {
    // console.log('updateParticles()');

    let count = 0;

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      if (particle.neighbors === null) {
        particle.neighbors = this.particles;
      }

      particle.updateCollisionForce =
        count >= this.collisionStartIndex &&
        count < this.collisionStartIndex + this.collisionBatchSize;

      for (let j = 0; j < this.behaviors.length; j++) {
        const behavior = this.behaviors[j];

        behavior.apply(particle);
      }

      particle.scaleVelocity(1 - this.friction);
      particle.update(deltaTime);

      count++;
    }

    if (this.particles.length > this.collisionBatchSize) {
      this.collisionStartIndex += this.collisionBatchSize;
    }
    if (
      this.collisionStartIndex >=
      this.particles.length + this.collisionBatchSize
    ) {
      this.collisionStartIndex = 0;
    }
  }

  updateSprings(deltaTime) {
    if (this.springs !== null) {
      for (let i = this.springIterationsCount; i > 0; i--) {
        for (let j = 0; j < this.springs.length; j++) {
          const spring = this.springs[j];

          spring.update(deltaTime);
        }
      }
    }
  }

  /**
   * Progresses the physics simulation by 1 time step and updates all forces
   * and particle positions accordingly
   */
  update(deltaTime = 1) {
    this.updateParticles(deltaTime);
    this.updateSprings(deltaTime);

    for (let i = 0; i < this.groups.length; i++) {
      const group = this.groups[i];

      group.update(deltaTime);
    }
  }

  returnIfConstrained(particle) {
    for (const constraint of this.constraints) {
      if (particle.equalsWithTolerance(constraint, 0.1)) {
        return constraint;
      }
    }

    return this.returnIfDuplicate(particle);
  }

  returnIfDuplicate(particle) {
    for (let i = 0; i < this.particles.length; i++) {
      const particle2 = this.particles[i];

      if (particle === particle2) {
        return particle2;
      }
    }
    this.particles.push(particle);
    return particle;
  }
}
