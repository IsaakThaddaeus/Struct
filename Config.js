// Config.js
import { Vector2 } from './Vector2.js';
import { Particle } from './Particle.js';
import { DistanceConstraint } from './DistanceConstraint.js';
import { Polygon } from './Polygon.js';

export class Config {
  constructor() {
    this.dt = 0.002;
    this.substeps = 5;
    this.dts = this.dt / this.substeps;
    this.gravity = new Vector2(0, 9.81);
    this.multiplier = 100;
    this.mu = 0.25;
    this.radius = 15;
    this.mass = 1;

    this.particles = [];
    this.constraints = [];
    this.polygons = [];
  }

  addParticle(x, y, mass = this.mass, radius = this.radius, color = '#D91424') {
    const particle = new Particle(x, y, mass, radius, color);
    this.particles.push(particle);
    return particle;
  }

  addDistanceConstraint(p1, p2, stiffness = 1) {
    const dts = this.dt / this.substeps;
    const constraint = new DistanceConstraint(p1, p2, stiffness, dts);
    this.constraints.push(constraint);
    return constraint;
  }

  addPolygon(position, rotation, points, color = '#F2A30F') {
    const polygon = new Polygon(position, rotation, points, color);
    this.polygons.push(polygon);
    return polygon;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }
}
