// ported by markuslerner.com from punktiert Processing library:
// https://github.com/djrkohler/punktiert/tree/master/src/punktiert/physics

import SimplePhysics from './SimplePhysics.js';
import HashGrid from '../math/HashGrid.js';

export default class GridPhysics extends SimplePhysics {
  constructor(props) {
    const {
      neighborRange = 80, // max distance for picking neighbors
    } = props;
    super(props);

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

    this.particles.forEach((particle) => {
      particle.neighbors = this.hashgrid.check(particle);

      this.neighborsCountAverage += particle.neighbors.size;
    });

    this.neighborsCountAverage /= this.particles.size;
    this.neighborsCountAverage = Math.round(this.neighborsCountAverage);

    super.update(deltaTime);
  }
}
