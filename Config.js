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
    this.paused = false;
    this.dt = 0.002;
    this.substeps = 5;
    this.dts = this.dt / this.substeps;
    this.gravity = new Vector2(0, 9.81);
    this.multiplier = 100;
    this.mu = 0.5;
    this.radius = 15;
    this.mass = 1;

    this.particles = [];
    this.constraints = [];
    this.mouseConstraint = null;
    this.volumeConstraints = [];
    this.environmentCollisionConstraints = [];
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

  addEnvironmentCollisionConstraint(particle, q, n) {
    const constraint = new EnvironmentCollisionConstraint(particle, q, n, this.mu);
    this.environmentCollisionConstraints.push(constraint);
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
      p.color = '#16B4F2';
      wheelParticles.push(p);
    }

    for (let i = 0; i < segments; i++) {
      const p1 = wheelParticles[i];
      const p2 = wheelParticles[(i + 1) % segments];
      this.addDistanceConstraint(p1, p2, stiffness);
    }

    const center = this.addParticle(x, y); // fixed center
    for (const p of wheelParticles) {
      this.addDistanceConstraint(center, p, stiffness);
    }
  }

  createBalloon(x, y, radius = 50, segments = 5, stiffness = 0) {
    const balloonParticles = [];

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      const p = this.addParticle(px, py, this.mass, this.radius, '#16B4F2');
      balloonParticles.push(p);
    }

    const volumeConstraint = new VolumeConstraint(balloonParticles, 0.1, this.dts);
    this.volumeConstraints.push(volumeConstraint);

    for (let i = 0; i < segments; i++) {
      const p1 = balloonParticles[i];
      const p2 = balloonParticles[(i + 1) % segments];
      this.addDistanceConstraint(p1, p2, stiffness);
    }

    return balloonParticles;
  }

}
