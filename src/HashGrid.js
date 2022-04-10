/**
 * used for internal speed optimization
 */

export default class HashGrid {
  constructor({ bucketSize = 100 }) {
    this.bucketSize = bucketSize;
    this.H = new Map();
    this.particles = new Set();
  }

  getXr(pos) {
    return Math.floor(pos.x / this.bucketSize);
  }

  getYr(pos) {
    return Math.floor(pos.y / this.bucketSize);
  }

  getKey(pos) {
    return this.getXr(pos) + '_' + this.getYr(pos);
  }

  add(particle) {
    this.particles.add(particle);
    this.insert(particle);
  }

  clear() {
    this.H.clear();
  }

  insert(particle) {
    // using array (faster):
    const hashKey = this.getKey(particle);
    if (this.H.get(hashKey) === undefined) {
      this.H.set(hashKey, [particle]);
    } else {
      let s = this.H.get(hashKey);
      s.push(particle);
      this.H.set(hashKey, s);
    }
  }

  updateAll() {
    this.H.clear();
    this.particles.forEach((particle) => {
      this.insert(particle);
    });

    // console.log(this.particles.size);
    // console.log(this.H.toJS());
  }

  check(pos) {
    const Xr = this.getXr(pos);
    const Yr = this.getYr(pos);
    const keys = [];
    let i = 0;
    for (let xr = Xr - 1; xr <= Xr + 1; xr++) {
      for (let yr = Yr - 1; yr <= Yr + 1; yr++) {
        keys[i++] = xr + '_' + yr;
      }
    }

    // using new Set:
    // let checked = new Set();
    // for(i = 0; i < keys.length; i++) {
    //   if(this.H.get(keys[i]) !== undefined) {
    //     checked = checked.merge(this.H.get(keys[i]));
    //   }
    // }
    // return checked;

    // using array (faster):
    let checked = [];
    for (i = 0; i < keys.length; i++) {
      if (this.H.get(keys[i]) !== undefined) {
        checked = checked.concat(this.H.get(keys[i]));
      }
    }
    return new Set(checked);
  }

  delete(p) {
    const hashKey = this.getKey(p);
    this.H.delete(hashKey);
    this.particles.delete(p);
  }

  size() {
    return this.H.size;
  }

  setBucketSize(bucketSize) {
    this.bucketSize = bucketSize;
  }
}
