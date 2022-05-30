# Particular

[![NPM Package](https://img.shields.io/npm/v/particular.svg?style=flat)](https://www.npmjs.com/package/particular)

Particle system written in JavaScript. Heavily inspired by [Punktiert](https://github.com/djrkohler/punktiert) Java library.

Yet another physics/particle system libary? I simply didn't find a JavaScript physics/particle system libary that is light-weight, behavior-based and works they way I imagined it. :)

### Hot it works:

1. Create physics:

```
const physics = new SimplePhysics();
```

2. Create particles and add to physics:

```
const particle = new Particle(x, y, z);
physics.addParticle(particle);
```

3. Add behavior:

```
particle.addBehavior(new Collision());
```

4. Update physics every frame:

```
physics.update();
```

Done.

Collaborations and improvements are welcome.

### Examples

- [All behaviors](https://)
- [Collision Starfield](https://)
- [Flocking](https://)
- [Seek/Arrive](https://)

### API Docs

To be created ...

### ToDo

- Create 3d flocking example with world box
- Create distance matrix for speed optimization
- Add missing behaviors and params to all behaviors example
- Consider writing behaviors as a plugin for matter.js
- Create other shapes (box, polygon)
- Create tabular api docs like https://swiperjs.com/swiper-api

### License

MIT licensed

Created by [Markus Lerner](http://www.markuslerner.com)
