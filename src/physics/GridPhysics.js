import SimplePhysics from './SimplePhysics.js';
import HashGrid from '../math/HashGrid.js';

// GridPhysics used HashGrid, supposed to be faster than SimplePhysics, but in some cases yields strange results

export default class GridPhysics extends SimplePhysics {
  constructor(props = {}) {
    super(props);

    const {
      neighborRange = 80, // max distance for picking neighbors
    } = props;

    this.hashgrid = new HashGrid({ neighborRange });
    this.neighborsCountAverage = 0;

    this.batchSize = 100;
    this.start = 0;
  }

  addParticle(particle) {
    const p = super.addParticle(particle);
    this.hashgrid.add(p);
    return p;
  }

  clear() {
    super.clear();
    this.hashgrid.clear();
    return this;
  }

  removeParticle(particle) {
    this.hashgrid.delete(particle);
    return super.removeParticle(particle);
  }

  update(deltaTime = 1) {
    this.hashgrid.updateAll();

    this.neighborsCountAverage = 0;

    for (const particle of this.particles) {
      particle.neighbors = this.hashgrid.check(particle);

      this.neighborsCountAverage += particle.neighbors.size;
    }

    this.neighborsCountAverage /= this.particles.size;
    this.neighborsCountAverage = Math.round(this.neighborsCountAverage);

    super.update(deltaTime);
  }
}
