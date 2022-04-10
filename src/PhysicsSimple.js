/**
 * particle physics engine using Verlet integration </p> based on:
 * http://en.wikipedia.org/wiki/Verlet_integration
 * http://www.teknikus.dk/tj/gdc2001.htm </p> this class is more or less an
 * modification/ extension of Karsten Schmidt's toxi.physics.VerletPhysics
 * class, http://toxiclibs.org ; </p> for convenience combined physics for 2D /
 * 3D; some addons for speed; and extended behaviors </p> Written by Daniel
 * Koehler - 2012 www.lab-eds.org for feedback please contact me at:
 * daniel@lab-eds.org
 * Default iterations for verlet solver: 50
 */
export default class PhysicsSimple {
  constructor({ friction = 0.95, numIterations = 50 }) {
    this.particles = new Set();
    this.springs = null;
    this.constraints = new Set();
    this.groups = null;
    this.behaviors = new Set();

    this.friction = friction;
    this.numIterations = numIterations;
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
    return this.returnIfConstrained(particle);
  }

  /**
   * Adds a spring to the list
   *
   * @param s
   * @return itself
   */
  addSpring(s) {
    if (this.springs === null) {
      this.springs = new Set();
    }
    if (this.getSpring(s.a, s.b) === null) {
      this.springs.add(s);
    }
    return this;
  }

  addConstraint(constraint) {
    this.constraints.add(constraint);
    return constraint;
  }

  /**
   * Adds a group (or String) to the List without affecting the global
   * particle calculation
   *
   * @param g
   *            VParticleGroup
   */
  addGroup(g) {
    if (this.groups === null) {
      this.groups = new Set();
    }
    this.groups.add(g);
  }

  clear() {
    this.particles.clear();
    this.springs.clear();
    return this;
  }

  getParticleByIndex(index) {
    return this.returnIfConstrainedByIndex(index);
  }

  getParticle(particle) {
    return this.returnIfConstrained(particle);
  }

  getfriction() {
    return this.friction;
  }

  getNumIterations() {
    return this.numIterations;
  }

  getParticles() {
    return new Set(this.particles);
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
    this.springs.forEach((s) => {
      if ((s.a === a && s.b === b) || (s.a === b && s.b === a)) {
        return s;
      }
    });
    return null;
  }

  /**
   * get the count of how many springs are connected to A
   *
   * @param a
   *            particle 1
   */
  getnumConnected(a) {
    let count = 0;
    if (this.springs != null) {
      this.springs.forEach((s) => {
        if (s.a === a || s.b === a) {
          count++;
        }
      });
    }
    return count;
  }

  /**
   * Removes a behavior from the simulation.
   *
   * @param b
   *            behavior to remove
   * @return true, if removed successfully
   */
  removeBehavior(behavior) {
    const found = this.behaviors.has(behavior);
    this.behaviors.delete(behavior);
    return found;
  }

  /**
   * Removes a constraint from the simulation.
   */
  removeConstraint(constraint) {
    const found = this.constraints.has(constraint);
    this.constraints.delete(constraint);
    return found;
  }

  /**
   * Removes a particle from the simulation.
   *
   * @param p
   *            particle to remove
   * @return true, if removed successfully
   */
  removeParticle(particle) {
    const found = this.particles.has(particle);
    this.particles.delete(particle);
    return found;
  }

  /**
   * Removes a spring connector from the simulation instance.
   *
   * @param s
   *            spring to remove
   * @return true, if the spring has been removed
   */
  removeSpring(spring) {
    const found = this.springs.has(spring);
    this.springs.delete(spring);
    return found;
  }

  /**
   * Removes a spring connector and its both end point particles from the
   * simulation
   *
   * @param s
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
   * @param g
   *            to remove
   * @return true, if the spring has been removed
   */
  removeGroup(group) {
    const found = this.groups.has(group);
    this.groups.delete(group);
    return found;
  }

  setFriction(friction) {
    this.friction = friction;
  }

  /**
   * @param numIterations
   *            the numIterations to set
   */
  setNumIterations(numIterations) {
    this.numIterations = numIterations;
  }

  /**
   * Updates all particle positions
   */
  updateParticles(deltaTime) {
    // console.log('updateParticles()');

    // let neighborsNumAverage = 0;

    this.particles.forEach((particle) => {
      if (particle.neighbors === null) {
        particle.neighbors = this.particles;
      }
      // neighborsNumAverage += particle.neighbors.size;

      this.behaviors.forEach((behavior) => {
        behavior.apply(particle);
      });
    });

    // neighborsNumAverage /= this.particles.size;

    // console.log(Math.round(neighborsNumAverage) + ' neighbors per particle by average');

    this.particles.forEach((particle) => {
      particle.scaleVelocity(this.friction);
      particle.update(deltaTime);
    });
  }

  updateSprings(deltaTime) {
    if (this.springs !== null) {
      for (let i = this.numIterations; i > 0; i--) {
        this.springs.forEach((spring) => {
          spring.update(deltaTime);
        });
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
      this.groups.forEach((group) => {
        this.group.update(deltaTime);
      });
    }
  }

  returnIfConstrained(particle) {
    this.constraints.forEach((constraint) => {
      if (particle.equalsWithTolerance(constraint, 0.1)) {
        return constraint;
      }
    });

    return this.returnIfDouble(particle);
  }

  // returnIfConstrainedByIndex(index) {
  //   VParticle p = particles.get(index);
  //   for (int i = 0; i < constraints.size(); i++) {
  //     VParticle other = (VParticle) constraints.get(i);
  //     if (p.equalsWithTolerance(other, .1f)) {
  //       return other;
  //     }
  //   }
  //   return p;
  // }

  returnIfDouble(particle) {
    this.particles.forEach((particle2) => {
      if (particle.equals(particle2)) {
        return particle2;
      }
    });
    this.particles.add(particle);
    return particle;
  }

  // end class
}
