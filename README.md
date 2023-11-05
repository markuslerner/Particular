# Particular

[![NPM Package](https://img.shields.io/npm/v/@markuslerner/particular.svg?style=flat)](https://www.npmjs.com/package/@markuslerner/particular)

Particle system written in JavaScript. Heavily inspired by [Punktiert](https://github.com/djrkohler/punktiert) Java library.

Why yet another physics/particle system libary? I simply didn't find a JavaScript physics/particle system libary that is GPU-accelerated, behavior-based (eg. flocking/swarm, seek/arrive) and works they way I was used to from earlier days in Java/Processing.

Collaborations and improvements welcome.

### Highlights

- GPU-accelerated (currently only Collision behavior) using gpu.js
- Simple API
- Behavior-based
- Vector3 API fully compatible with [THREE.js](https://github.com/mrdoob/three.js/) [Vector3](https://threejs.org/docs/#api/en/math/Vector3)

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

#### SimplePhysics class

**Constructor**

`new SimplePhysics({ friction = 0.95, springIterationsCount = 50 } = {});`

**Members:**

Member | Type | Default | Description
:----- | :--- | :------ | :----------
`behaviors` | Set | new Set() | Behaviors for all particles
`constraints` | Set | new Set() | Constraints for all particles
`groups` | Set | new Set() | Groups of particles (not implemented yet)
`particles` | Set | new Set() | All particles
`springs` | Set | new Set() | All springs (not implemented yet)
`friction` | number | 0.95;
`springIterationsCount` | number | 50;

**Public Methods:**

Method | Return value | Description
:----- | :----------- | :----------
`addBehavior(behavior: Object)` | | Add behavior to all particles
`addParticle(particle: Particle)` | | Add particle
`addSpring(spring: Spring)` | | Not implmemented yet
`addGroup(group: Group)` | | Not implmemented yet
`clear()` | | Clear particles, groups and springs
`getSpring(a: Particle, b: Particle)` | Spring | Attempts to find the spring element between the 2 particles supplied
`getnumConnected(spring: Spring)` | number | Get the count of how many springs are connected to A
`hasBehavior(behavior: Behavior)` | Behavior | Check, if physics has this behavior
`hasGroup(group: Group)` | Group | Check, if physics has this group
`hasParticle(particle: Particle)` | Particle | Check, if physics has this particle
`hasSpring(spring: Spring)` | Spring | Check, if physics has this spring
`removeBehavior(behavior: Behavior)` | boolean | Remove behavior
`removeParticle(particle: Particle)` | boolean | Remove particle
`removeSpring(spring: Spring)` | boolean | Remove spring
`removeSpringElements(spring: Spring)` | boolean | Removes a spring connector and its both end point particles
`removeGroup(group: Group)` | boolean | Remove group
`update(deltaTime: number = 1)` | | Update simulation


#### Particle class

Extends Vector3 class

Vector3 API is fully compatible with [THREE.js](https://github.com/mrdoob/three.js/) Vector3.

**Constructor**

`new Particle(x: number = 0.0, y: number = 0.0, z: number = 0.0, mass: number = 1.0, radius: number = 1.0);`

**Members:**

Member | Type | Default | Description
:----- | :--- | :------ | :----------
`x` | number | 0.0
`y` | number | 0.0
`z` | number | 0.0
`locked` | boolean | false | Particle lock status
`behaviors` | Set | null | Particle behaviors
`neighbors` | Set | null | Particle neighbors
`mass` | number | 1.0
`radius` | number | 1.0
`friction` | number | 0.0
`maxSpeed` | number | 3.0
`force` | Vector3 | new Vector3()
`velocity` | Vector3 | new Vector3()
`velocitySmooth` | Vector3 | new Vector3()
`followers` | Set | new Set() | Follower which will copy this particle’s position

**Public Methods:**

Method | Return value | Description
:----- | :----------- | :----------
`addBehavior(behavior: Object, addEvenIfExists: boolean = false)` | this | Add behavior to this particle only
`getBehavior(behaviorClass: Class)` | Instance of Behavior | Get behavior by behavior class
`addFollower(vector: Vector3)` | | Will copy this particle’s position
`addForce(force: Vector3)` | this | Add force to this particle, used by behaviors
`clearForce()` | this | Clear force
`clearVelocity()` | this | Clear velocity
`getVelocity()` | Vector3 | Get velocity
`lock()` | this | Lock this particle’s position
`removeBehavior(behavior: Object)` | boolean | Remove behavior, returns true, if behavior was found
`removeFollower(follower: Object)` | boolean | Remove follower, returns true, if follower was found
`unlock()` | this | Unlock this particle’s position
`constrainX(min: number, max: number)` | | Constrain x
`constrainY(min: number, max: number)` | | Constrain y
`constrainZ(min: number, max: number)` | | Constrain z



### Available Behaviors:

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

### Editing source

In order to edit the source code, run:

```console
yarn start
```

And open http://127.0.0.1:8000/ in your browers.

The files in the `build` folder will automatically be rebuilt when modified.

### To Do

- Add gpu acceleration for Align, Cohesion and Separate behaviors as well
- Create 3D flocking example
- Add missing behaviors and params to all behaviors example
- Consider writing behaviors as a plugin for matter.js
- Create other shapes (box, polygon)

### License

MIT licensed

Created by [Markus Lerner](http://www.markuslerner.com)
