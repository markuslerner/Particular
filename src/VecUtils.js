export const limit = (vec3, length) => {
  if (vec3.lengthSq() > length * length) {
    vec3.setLength(length)
  }
}

export const constrainX = (vec3, min, max) => {
  if (vec3.x < min) vec3.x = min
  if (vec3.x > max) vec3.x = max
}

export const constrainY = (vec3, min, max) => {
  if (vec3.y < min) vec3.y = min
  if (vec3.y > max) vec3.y = max
}

export const constrainZ = (vec3, min, max) => {
  if (vec3.z < min) vec3.z = min
  if (vec3.z > max) vec3.z = max
}

export default {
  limit,
  constrainX,
  constrainY,
  constrainZ,
}
