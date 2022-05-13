// ported by markuslerner.com from punktiert Processing library:
// https://github.com/djrkohler/punktiert/tree/master/src/punktiert/physics

import SimplePhysics from './SimplePhysics.js';
import HashGrid from '../math/HashGrid.js';

/**
 * A particle physics engine using Verlet integration </p> based on:
 * http://en.wikipedia.org/wiki/Verlet_integration
 * http://www.teknikus.dk/tj/gdc2001.htm </p> this class is more or less an
 * modification/ extension of Karsten Schmidt's toxi.physics.VerletPhysics
 * class, http://toxiclibs.org ; </p> for convenience combined physics for 2D /
 * 3D; some addons for speed; and extended behaviors </p> </p> Written by Daniel
 * Koehler - 2012 www.lab-eds.org for feedback please contact me at:
 * daniel@lab-eds.org
 */
export default class GridPhysics extends SimplePhysics {
  constructor(props) {
    const {
      min = null,
      max = null,
      bounce = false,
      neighborRange = 80, // max distance for picking neighbors
      friction = 0.95,
      springIterationsCount = 50,
    } = props;
    super(props);

    this.hashgrid = new HashGrid({ neighborRange });
    this.box = null; // Bounding Box
    this.neighborsCountAverage = 0;

    this.batchSize = 100;
    this.start = 0;

    if (min !== null && max !== null) {
      // this.box = new WorldBox(min, max);
      this.box.setBounceSpace(bounce);
      this.box.setWrapSpace(!bounce);
      this.addBehavior(this.box);
    }
  }

  /**
   * Adds a particle to the list
   *
   * @param p
   * @return itself
   */
  addParticle(particle) {
    const p = super.addParticle(particle);
    this.hashgrid.add(p);
    return p;
  }

  setBox(min, max) {
    if (this.box === null) {
      this.box = new WorldBox(min, max);
    } else {
      this.box.setMin(min);
      this.box.setMax(max);
    }
  }

  setBounceSpace(bounce) {
    if (this.box !== null) {
      this.box.setBounceSpace(bounce);
    }
  }

  setWrappedSpace(wrap) {
    if (this.box !== null) {
      this.box.setWrapSpace(wrap);
    }
  }

  clear() {
    super.clear();
    this.hashgrid.clear();
    return this;
  }

  /**
   * Removes a particle from the simulation.
   *
   * @param p
   *            particle to remove
   * @return true, if removed successfully
   */
  removeParticle(particle) {
    this.hashgrid.delete(particle);
    return super.removeParticle(particle);
  }

  update(deltaTime = 1) {
    this.hashgrid.updateAll();

    this.neighborsCountAverage = 0;

    this.particles.forEach((particle) => {
      particle.neighbors = this.hashgrid.check(particle);

      this.neighborsCountAverage += particle.neighbors.size;
    });

    this.neighborsCountAverage /= this.particles.size;
    this.neighborsCountAverage = Math.round(this.neighborsCountAverage);

    super.update(deltaTime);
  }
}
