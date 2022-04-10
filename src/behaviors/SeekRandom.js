import { Math as Math2, Vector3 } from 'three'
import { limit } from '../VecUtils.js'

// Based on Seek, automatically creates new random target within min and max (box space)

export default class SeekRandom {
  constructor({
    maxSpeed = 3.5,
    maxForce = 0.5,
    min = new Vector3(-10, -10, -10),
    max = new Vector3(10, 10, 10),
    distanceMin = 0.01,
    slowDownDistance = 0.0,
  }) {
    this.maxSpeed = maxSpeed
    this.maxForce = maxForce
    this.min = min
    this.max = max
    this.distanceMin = distanceMin < maxForce ? maxForce : distanceMin
    this.slowDownDistance = slowDownDistance

    this.setRandomTarget()
  }

  apply(particle) {
    const f = this.seek(particle)

    particle.addForce(f)
  }

  setMin(min) {
    this.min = min

    this.setRandomTarget()
  }

  setMax(max) {
    this.max = max

    this.setRandomTarget()
  }

  seek(particle) {
    const desired = new Vector3().copy(this.target)
    desired.sub(particle)
    const dist = desired.length()

    if (dist <= this.distanceMin) {
      this.setRandomTarget()
    } else if (dist < this.slowDownDistance) {
      desired.setLength((this.maxSpeed * dist) / this.slowDownDistance)
    } else {
      desired.setLength(this.maxSpeed)
    }

    desired.sub(particle.getVelocity())
    limit(desired, this.maxForce)

    return desired
  }

  setRandomTarget() {
    this.target = new Vector3(
      Math2.randFloat(this.min.x, this.max.x),
      Math2.randFloat(this.min.y, this.max.y),
      Math2.randFloat(this.min.z, this.max.z),
    )
  }

  setSlowDownDistance(slowDownDistance) {
    this.slowDownDistance = slowDownDistance
  }
}
