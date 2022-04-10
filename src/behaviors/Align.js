import { Vector3 } from 'three';
import { limit } from '../VecUtils.js';

const ali = new Vector3();

/**
 * Local Particle Behavior: compares the passed in Particle to its own list of neighbors
 * </p> addBehavior to the VParticle.behaviors;
 * </p> Alignment algorythm based on: Craig Reynold's Boids program to simulate the flocking behavior of birds. Here just the rule of Alignment. </p> Java
 * implementation Daniel Shiffman (www.shiffman.net); Jose Sanchez (www.plethora-project.com)
 */
export default class Align {
  constructor({ distance = 50, maxSpeed = 3.0, maxForce = 0.05 }) {
    this.distance = distance;
    this.distanceSquared = this.distance * this.distance;
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;
  }

  apply(particle) {
    const f = this.align(particle);

    particle.addForce(f);
  }

  align(particle) {
    ali.set(0, 0, 0);
    let countAli = 0;

    particle.neighbors.forEach((neighbor) => {
      if (neighbor !== particle) {
        const d = particle.distanceToSquared(neighbor);

        if (d < this.distanceSquared) {
          ali.add(neighbor.getVelocity());
          countAli++;
        }
      }
    });

    if (countAli > 0) {
      ali.multiplyScalar(1.0 / countAli);
    }
    if (ali.lengthSq() > 0) {
      ali.setLength(this.maxSpeed);
      ali.sub(particle.getVelocity());
      limit(ali, this.maxForce);
    }
    return ali;
  }

  getDistance() {
    return this.distance;
  }

  setDistance(distance) {
    this.distance = distance;
    this.distanceSquared = this.distance * this.distance;
  }

  getMaxSpeed() {
    return this.maxSpeed;
  }

  setMaxSpeed(maxSpeed) {
    this.maxSpeed = maxSpeed;
  }

  getMaxForce() {
    return this.maxForce;
  }

  setMaxForce(maxForce) {
    this.maxForce = maxForce;
  }
}
