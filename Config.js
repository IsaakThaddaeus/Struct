// Config.js
import { Vector2 } from './Vector2.js';
import { Particle } from './Particle.js';
import { DistanceConstraint } from './Constraints/DistanceConstraint.js';
import { MouseDistanceConstraint } from './Constraints/MouseDistanceConstraint.js';
import { EnvironmentCollisionConstraint } from './Constraints/EnvironmentCollisionConstraint.js';
import { Polygon } from './Polygon.js';
import { VolumeConstraint } from './Constraints/VolumeConstraint.js';

export class Config {
  constructor() {
    this.canvas = null;
    this.paused = false;
    this.dt = 0.0166;
    this.substeps = 10;
    this.dts = this.dt / this.substeps;
    this.dts2 = this.dts * this.dts;
    this.gravity = new Vector2(0, 9.81);
    this.multiplier = 15;
    this.mu = 0.5;
    this.muSp = 0.5;
    this.muKp = 0.3;

    this.particles = [];
    this.constraints = [];
    this.mouseConstraint = null;
    this.environmentCollisionConstraints = [];
    this.polygons = [];
  }

  addParticle(x, y, mass, radius, color) {
    const particle = new Particle(x, y, mass, radius, color);
    this.particles.push(particle);
    return particle;
  }

  addDistanceConstraint(p1, p2, stiffness, damping, color) {
    const constraint = new DistanceConstraint(p1, p2, stiffness, damping, this, color);
    this.constraints.push(constraint);
    return constraint;
  }

  addMouseDistanceConstraint(particle, mousePos, stiffness, damping, color) {
    const constraint = new MouseDistanceConstraint(particle, mousePos, stiffness, damping, this, color);
    this.mouseConstraint = constraint;
    return constraint;
  }

  addEnvironmentCollisionConstraint(particle, q, n) {
    const constraint = new EnvironmentCollisionConstraint(particle, q, n, this.mu);
    this.environmentCollisionConstraints.push(constraint);
    return constraint;
  }

  addPolygon(position, rotation, points, color) {
    const polygon = new Polygon(position, rotation, points, color);
    this.polygons.push(polygon);
    return polygon;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  setDts(numSubsteps) {
    this.substeps = numSubsteps;
    this.dts = this.dt / this.substeps;
    this.dts2 = this.dts * this.dts;
  }


  createBox2x2(x, y, spacing, stiffness = 0) {
    const p0 = this.addParticle(x, y);
    const p1 = this.addParticle(x + spacing, y);
    const p2 = this.addParticle(x, y + spacing);
    const p3 = this.addParticle(x + spacing, y + spacing);

    this.addDistanceConstraint(p0, p1, stiffness);
    this.addDistanceConstraint(p0, p2, stiffness);
    this.addDistanceConstraint(p1, p3, stiffness);
    this.addDistanceConstraint(p2, p3, stiffness);
    this.addDistanceConstraint(p0, p3, stiffness);
    this.addDistanceConstraint(p1, p2, stiffness);
  }

  createRope(x, y, count, spacing, stiffness = 0) {
    const start = this.particles.length;
    for (let i = 0; i < count; i++) {
      const isEnd = i === 0 || i === count - 1;
      const p = this.addParticle(
        x + i * spacing,
        y,
        isEnd ? 0 : this.mass,
        this.radius,
        isEnd ? '#16B4F2' : '#155FBF'
      );
    }
    for (let i = 0; i < count - 1; i++) {
      this.addDistanceConstraint(this.particles[start + i], this.particles[start + i + 1], stiffness);
    }
  }

  createWheel(x, y, radius = 50, segments = 5, stiffness = 0) {
    const wheelParticles = [];

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      const p = this.addParticle(px, py);
      wheelParticles.push(p);
    }

    for (let i = 0; i < segments; i++) {
      const p1 = wheelParticles[i];
      const p2 = wheelParticles[(i + 1) % segments];
      this.addDistanceConstraint(p1, p2, stiffness, undefined, '#16B4F2');
    }

    const center = this.addParticle(x, y); // fixed center
    for (const p of wheelParticles) {
      this.addDistanceConstraint(center, p, stiffness, undefined, '#16B4F2');
    }
  }


}
