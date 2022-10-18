# Particular

[![NPM Package](https://img.shields.io/npm/v/@markuslerner/particular.svg?style=flat)](https://www.npmjs.com/package/@markuslerner/particular)

Particle system written in JavaScript. Heavily inspired by [Punktiert](https://github.com/djrkohler/punktiert) Java library.

Why yet another physics/particle system libary? I simply didn't find a JavaScript physics/particle system libary that is GPU-accelerated, behavior-based (eg. flocking/swarm, seek/arrive) and works they way I was used to from earlier days in Java/Processing.

Collaborations and improvements welcome.

### Highlights

- Simple API
- GPU-accelerated (currently only Collision behavior) using gpu.js
- Vector3 API is fully compatible with [THREE.js](https://github.com/mrdoob/three.js/) [Vector3](https://threejs.org/docs/#api/en/math/Vector3)

### Usage

```console
yarn add @markuslerner/particular
```

or

```console
npm install @markuslerner/particular
```

1. Include classes from this package:

```js
import {
  SimplePhysics,
  Particle,
  Collision,
  Seek,
} from '@markuslerner/particular';
```

2. Create physics:

```js
const physics = new GPUPhysics();
```

3. Create particle(s) and add to physics:

```js
const particle = new Particle(x, y, z);
physics.addParticle(particle);
```

4. Add behavior(s):

```js
particle.addBehavior(new Collision());
particle.addBehavior(new Seek());
```

5. Update physics every frame:

```js
physics.update();
```

Done.

Collaborations and improvements are welcome.

### Examples

- [All behaviors](https://dev.markuslerner.com/particular/examples/all-behaviors.html)
- [Collision Starfield](https://dev.markuslerner.com/particular/examples/collision-starfield.html)
- [Flocking](https://dev.markuslerner.com/particular/examples/flocking.html)
- [Seek/Arrive](https://dev.markuslerner.com/particular/examples/seek-arrive.html)

### Editing source code and examples

To edit the source code and the examples, run:

```console
yarn start
```

or

```console
npm start
```

A development server will be launched under http://localhost:8000/

The files from the src folder will we re-built automatically into a virtual build/particular.js upon reloading the page.

### API Docs

To be created ...

- Particle extends Vector3
- Vector3 API is fully compatible with [THREE.js](https://github.com/mrdoob/three.js/) Vector3.

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

- Add gpu acceleration for Align, Cohesion and Separate behaviors as well
- Create 3D flocking example
- Add missing behaviors and params to all behaviors example
- Consider writing behaviors as a plugin for matter.js
- Create other shapes (box, polygon)
- Create tabular api docs like https://swiperjs.com/swiper-api

### License

MIT licensed

Created by [Markus Lerner](http://www.markuslerner.com)
