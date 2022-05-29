import { Vector3 } from '../index.js';

export default class Constrain {
  constructor({
    min = new Vector3(-1, -1, -1),
    max = new Vector3(1, 1, 1),
  } = {}) {
    this.min = min;
    this.max = max;
    this.enabled = true;
  }

  apply(p) {
    if (this.enabled) {
      if (p.x <= this.min.x) {
        p.x = this.min.x;
      }
      if (p.y <= this.min.y) {
        p.y = this.min.y;
      }
      if (p.z <= this.min.z) {
        p.z = this.min.z;
      }
      if (p.x >= this.max.x) {
        p.x = this.max.x;
      }
      if (p.y >= this.max.y) {
        p.y = this.max.y;
      }
      if (p.z >= this.max.z) {
        p.z = this.max.z;
      }
    }
  }
}
