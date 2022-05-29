import { Vector3 } from '../index.js';

export default class Bounce {
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
        p.velocity.x *= -1;
      }
      if (p.y <= this.min.y) {
        p.y = this.min.y;
        p.velocity.y *= -1;
      }
      if (p.z <= this.min.z && this.min.z !== this.max.z) {
        p.z = this.min.z;
        p.velocity.z *= -1;
      }
      if (p.x >= this.max.x) {
        p.x = this.max.x;
        p.velocity.x *= -1;
      }
      if (p.y >= this.max.y) {
        p.y = this.max.y;
        p.velocity.y *= -1;
      }
      if (p.z >= this.max.z && this.min.z !== this.max.z) {
        p.z = this.max.z;
        p.velocity.z *= -1;
      }

      if (this.min.z === this.max.z) {
        p.z = this.max.z;
        p.velocity.z = 0;
      }
    }
  }
}
