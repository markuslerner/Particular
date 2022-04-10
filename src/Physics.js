// ported by markuslerner.com from punktiert Processing library:
// https://github.com/djrkohler/punktiert/tree/master/src/punktiert/physics

import PhysicsSimple from './PhysicsSimple.js';
import HashGrid from './HashGrid.js';

let count = 0;
const gridUpdateInterval = 1;
// const batchSize = 100;
// let start = 0;

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
export default class Physics extends PhysicsSimple {
  /**
   * Initializes an Verlet engine instance
   *
   */
  constructor({ min = null, max = null, bounce = false, neighborRange = 80 }) {
    super();

    this.hashgrid = new HashGrid(neighborRange);
    this.box = null; // Bounding Box
    this.springMap = null;

    if (min !== null && max !== null) {
      // this.box = new BWorldBox(min, max);
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
    const p = this.returnIfConstrained(particle);
    super.addParticle(p);
    this.hashgrid.add(p);
    return p;
  }

  /**
   * Adds a spring to the list
   *
   * @param s
   * @return itself
   */
  // public VPhysicsSimple addSpring(VSpring s) {
  //   if (this.springs == null)
  //     this.springs = new ArrayList<VSpring>();
  //   if (this.springMap == null)
  //     this.springMap = new HashMapSprings(particles.size() * 4);

  //   if (getSpring(s.a, s.b) == null) {
  //     springs.add(s);
  //     this.springMap.insert(s);
  //   }
  //   return this;
  // }

  /**
   * Attempts to find the spring element between the 2 particles supplied
   *
   * @param a
   *            particle 1
   * @param b
   *            particle 2
   * @return spring instance, or null if not found
   */
  // public VSpring getSpring(Vec a, Vec b) {
  //   if (springMap != null) {
  //     if (springMap.containsKey(a)) {
  //       ArrayList<VSpring> aSprings = (ArrayList<VSpring>) springMap.get(a);
  //       for (VSpring s : aSprings) {
  //         if ((s.a == a && s.b == b) || (s.a == b && s.b == a)) {
  //           return s;
  //         }
  //       }
  //     }
  //   }
  //   return null;
  // }

  /**
   * get the count of how many springs are connected to A
   *
   * @param a
   *            particle 1
   * @return count
   */
  // public int getnumConnected(Vec a) {
  //   int count = 0;
  //   if (springMap != null) {
  //     if (springMap.containsKey(a)) {
  //       ArrayList<VSpring> aSprings = (ArrayList<VSpring>) springMap.get(a);
  //       count = aSprings.size();
  //       return count;
  //     }
  //   }
  //   return count;
  // }

  // public void setBox(Vec min, Vec max) {
  //   if (this.box == null) {
  //     this.box = new BWorldBox(min, max);
  //   } else {
  //     this.box.setMin(min);
  //     this.box.setMax(max);
  //   }
  // }

  // public void setBounceSpace(boolean bounce) {
  //   if (this.box != null) {
  //     this.box.setBounceSpace(bounce);
  //   }
  // }

  // public void setWrappedSpace(boolean wrap) {
  //   if (this.box != null) {
  //     this.box.setWrapSpace(wrap);
  //   }
  // }

  clear() {
    super.clear();
    this.hashgrid.clear();
    if (this.springMap != null) {
      this.springMap.clear();
    }
    return this;
  }

  /**
   * Removes a particle from the simulation.
   *
   * @param p
   *            particle to remove
   * @return true, if removed successfully
   */
  removeParticle(p) {
    this.hashgrid.delete(p);
    return super.removeParticle(p);
  }

  /**
   * Removes a spring connector from the simulation instance.
   *
   * @param s
   *            spring to remove
   * @return true, if the spring has been removed
   */
  removeSpring(s) {
    this.springMap.delete(s);
    return super.removeSpring(s);
  }

  updateParticles(deltaTime) {
    // console.log(this.hashgrid.H.toJS());

    // let neighborsNumAverage = 0;

    this.particles.forEach((particle) => {
      // if(particle.neighbors === null || (key >= start && key < start + batchSize)) {
      particle.neighbors = this.hashgrid.check(particle);

      // neighborsNumAverage += particle.neighbors.size;

      this.behaviors.forEach((behavior) => {
        behavior.apply(particle);
      });
    });

    // start += batchSize;
    // if(start > this.particles.size + batchSize) {
    //   start = 0;
    // }

    // neighborsNumAverage /= this.particles.size;

    // console.log(Math.round(neighborsNumAverage) + ' neighbors per particle by average');

    this.particles.forEach((particle) => {
      particle.scaleVelocity(this.friction);
      particle.update(deltaTime);
    });
  }

  update(deltaTime = 1) {
    let doUpdate = false;
    if (count === gridUpdateInterval) {
      doUpdate = true;
      count = 0;
    }
    count++;

    if (doUpdate) {
      this.hashgrid.updateAll();
    }
    this.updateParticles(deltaTime);
    this.updateSprings();
  }
}
