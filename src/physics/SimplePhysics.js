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
  constructor({ friction = 0.95, springIterationsCount = 50 } = {}) {
    this.behaviors = new Set();
    this.groups = new Set();
    this.particles = new Set();
    this.springs = new Set();

    this.friction = friction;
    this.springIterationsCount = springIterationsCount;
  }

  /**
   * Adds a behavior to the list
   *
   * @param behavior
   */
  addBehavior(behavior) {
    this.behaviors.add(behavior);
  }

  /**
   * Adds a particle to the list
   *
   * @param p
   * @return itself
   */
  addParticle(particle) {
    return this.returnIfDuplicate(particle);
  }

  /**
   * Adds a spring to the list
   *
   * @param s
   * @return itself
   */
  addSpring(s) {
    if (this.getSpring(s.a, s.b) === null) {
      this.springs.add(s);
    }
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
    return this.groups.add(g);
  }

  clear() {
    this.particles.clear();
    this.springs.clear();
    this.groups.clear();
    return this;
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
    if (this.springs != null) {
      for (const s of this.springs) {
        if (s.a === spring || s.b === spring) {
          count++;
        }
      }
    }
    return count;
  }

  hasBehavior(behavior) {
    return this.behaviors.has(behavior);
  }

  hasGroup(group) {
    return this.groups.has(group);
  }

  hasParticle(particle) {
    return this.particles.has(particle);
  }

  hasSpring(spring) {
    return this.springs.has(spring);
  }

  /**
   * Removes a behavior from the simulation.
   *
   * @param behavior
   *            behavior to remove
   * @return true, if removed successfully
   */
  removeBehavior(behavior) {
    return this.behaviors.delete(behavior);
  }

  /**
   * Removes a particle from the simulation.
   *
   * @param particle
   *            particle to remove
   * @return true, if removed successfully
   */
  removeParticle(particle) {
    return this.particles.delete(particle);
  }

  /**
   * Removes a spring connector from the simulation instance.
   *
   * @param spring
   *            spring to remove
   * @return true, if the spring has been removed
   */
  removeSpring(spring) {
    return this.springs.delete(spring);
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
    return this.groups.delete(group);
  }

  /**
   * Updates all particle positions
   */
  updateParticles(deltaTime) {
    // console.log('updateParticles()');

    for (const particle of this.particles) {
      if (particle.neighbors === null) {
        particle.neighbors = this.particles;
      }

      for (const behavior of this.behaviors) {
        behavior.apply(particle);
      }

      particle.scaleVelocity(1 - this.friction);
      particle.update(deltaTime);
    }
  }

  updateSprings(deltaTime) {
    if (this.springs !== null) {
      for (let i = this.springIterationsCount; i > 0; i--) {
        for (const s of this.springs) {
          s.update(deltaTime);
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

    if (this.groups !== null) {
      for (const group of this.groups) {
        group.update(deltaTime);
      }
    }
  }

  returnIfDuplicate(particle) {
    for (const particle2 of this.particles) {
      if (particle === particle2) {
        return particle2;
      }
    }
    this.particles.add(particle);
    return particle;
  }
}
