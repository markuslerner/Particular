# Particular

[![NPM Package](https://img.shields.io/npm/v/@markuslerner/particular.svg?style=flat)](https://www.npmjs.com/package/@markuslerner/particular)

Particle system written in JavaScript. Heavily inspired by [Punktiert](https://github.com/djrkohler/punktiert) Java library.

Why yet another physics/particle system libary? I simply didn't find a JavaScript physics/particle system libary that is light-weight, behavior-based (eg. flocking/swarm, seek/arrive) and works they way I was used to from earlier days in Java/Processing.

Collaborations and improvements are welcome.

### Highlights

- Light-weight
- No other dependencies
- Vector3 api fully compatible with [THREE.js](https://github.com/mrdoob/three.js/) [Vector3](https://threejs.org/docs/#api/en/math/Vector3)

### Hot it works:

1. Include classes from this package:

```
import { SimplePhysics, Particle, Collision, Seek } from "@markuslerner/particular";
```

2. Create physics:

```
const physics = new SimplePhysics();
```

3. Create particle(s) and add to physics:

```
const particle = new Particle(x, y, z);
physics.addParticle(particle);
```

4. Add behavior(s):

```
particle.addBehavior(new Collision());
particle.addBehavior(new Seek());
```

5. Update physics every frame:

```
physics.update();
```

Done.

Collaborations and improvements are welcome.

### Examples

- [All behaviors](https://dev.markuslerner.com/particular/index.html)
- [Collision Starfield](https://dev.markuslerner.com/particular/collision-starfield.html)
- [Flocking](https://dev.markuslerner.com/particular/flocking.html)
- [Seek/Arrive](https://dev.markuslerner.com/particular/seek-arrive.html)

### API Docs

To be created ...

Vector3 api is fully compatible with [THREE.js](https://github.com/mrdoob/three.js/) Vector3.

Available Behaviors:

- Align: align movement with neighbors
- Avoid: avoid single target
- Bounce: bounce off world box
- Cohesion: keep close to neighbors
- Collision: avoid collision with neighbors
- Constrain: keep within world box
- Seek: seek single target
- SeekRandom: seek single random target
- Separate: separate from neighbors
- Wander: random wander movment
- Wrap: wrap around word box

### To Do

- Create 3D flocking example
- Create distance matrix for speed optimization
- Add missing behaviors and params to all behaviors example
- Consider writing behaviors as a plugin for matter.js
- Create other shapes (box, polygon)
- Create tabular api docs like https://swiperjs.com/swiper-api

### License

MIT licensed

Created by [Markus Lerner](http://www.markuslerner.com)
