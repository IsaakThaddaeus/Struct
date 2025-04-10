import { Vector2 } from './Vector2.js';
import { Particle } from './Particle.js';
import { DistanceConstraint } from './DistanceConstraint.js';
import { Polygon } from './Polygon.js';

export function createSceneConfig() {
  const radius = 15;
  const mass = 1;
  const dts = 0.002 / 5;

  const particles = [];
  const constraints = [];
  const polygons = [];

  particles.push(new Particle(740, 100, 0, radius, '#155FBF'));

  createBox2x2(900, 100, 50);
  createBox2x2(500, 250, 50);
  createBox2x2(320, 250, 50);
  createBox2x2(220, 300, 50);
  createBox2x2(700, 250, 50);
  createBox2x2(500, 100, 50);
  createRope(200, 200, 20, 30);

  const points = [
    new Vector2(0, 0),
    new Vector2(300, 0),
    new Vector2(300, 300),
    new Vector2(0, 300)
  ];
  polygons.push(new Polygon(new Vector2(200, 400), 30, points));
  polygons.push(new Polygon(new Vector2(600, 400), -30, points));

  constraints.push(new DistanceConstraint(particles[0], particles[1], 1, dts));
  constraints.push(new DistanceConstraint(particles[0], particles[5], 0.5, dts));
  constraints.push(new DistanceConstraint(particles[9], particles[14], 0, dts));

  return {
    dt: 0.002,
    substeps: 5,
    gravity: new Vector2(0, 9.81),
    multiplier: 100,
    mu: 0.5,
    radius,
    mass,
    particles,
    constraints,
    polygons
  };


  function createBox2x2(x, y, space, stiffness = 0) {
    const i = particles.length;
    particles.push(new Particle(x, y, mass, radius));
    particles.push(new Particle(x + space, y, mass, radius));
    particles.push(new Particle(x, y + space, mass, radius));
    particles.push(new Particle(x + space, y + space, mass, radius));

    constraints.push(new DistanceConstraint(particles[i],     particles[i + 1], stiffness, dts));
    constraints.push(new DistanceConstraint(particles[i],     particles[i + 2], stiffness, dts));
    constraints.push(new DistanceConstraint(particles[i + 1], particles[i + 3], stiffness, dts));
    constraints.push(new DistanceConstraint(particles[i + 2], particles[i + 3], stiffness, dts));
    constraints.push(new DistanceConstraint(particles[i],     particles[i + 3], stiffness, dts));
    constraints.push(new DistanceConstraint(particles[i + 1], particles[i + 2], stiffness, dts));
  }

  function createRope(x, y, count, spacing, stiffness = 0) {
    const start = particles.length;
    for (let i = 0; i < count; i++) {
      const isEnd = i === 0 || i === count - 1;
      particles.push(new Particle(x + i * spacing, y, isEnd ? 0 : mass, radius, isEnd ? '#16B4F2' : '#155FBF'));
    }
    for (let i = 0; i < count - 1; i++) {
      constraints.push(new DistanceConstraint(particles[start + i], particles[start + i + 1], stiffness, dts));
    }
  }
}
