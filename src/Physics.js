// ported by markuslerner.com from punktiert Processing library:
// https://github.com/djrkohler/punktiert/tree/master/src/punktiert/physics

import PhysicsSimple from './PhysicsSimple.js';
import HashGrid from './HashGrid.js';

let count = 0;
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
    this.springMap = null;
    this.neighborsCountAverage = 0;

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
  removeParticle(particle) {
    this.hashgrid.delete(particle);
    return super.removeParticle(particle);
  }

  /**
   * Removes a spring connector from the simulation instance.
   *
   * @param s
   *            spring to remove
   * @return true, if the spring has been removed
   */
  removeSpring(spring) {
    this.springMap.delete(spring);
    return super.removeSpring(spring);
  }

  update(deltaTime = 1) {
    this.hashgrid.updateAll();

    this.neighborsCountAverage = 0;

    this.particles.forEach((particle) => {
      // if(particle.neighbors === null || (key >= start && key < start + batchSize)) {
      particle.neighbors = this.hashgrid.check(particle);

      this.neighborsCountAverage += particle.neighbors.size;
    });

    // start += batchSize;
    // if (start > this.particles.size + batchSize) {
    //   start = 0;
    // }

    this.neighborsCountAverage /= this.particles.size;
    this.neighborsCountAverage = Math.round(this.neighborsCountAverage);

    super.update(deltaTime);
  }
}
