// SceneBuilder.js
import { Config } from './Config.js';
import { Vector2 } from './Vector2.js';


export class SceneBuilder {
  static buildDefaultScene(canvas) {
    const config = new Config();
    config.setCanvas(canvas);

    config.addParticle(800, 100, 0, config.radius, '#16B4F2');
    this.createBox2x2(config, 900, 100, 50);
    this.createBox2x2(config, 500, 250, 50);
    this.createBox2x2(config, 700, 250, 50);
    this.createBox2x2(config, 500, 50, 50);
    this.createRope(config, 200, 150, 20, 30);
    this.createWheel(config, 300, 250, 55, 8, 0.01);
    this.createWheel(config, 1100, 200, 55, 8, 0.01);
   // this.createBalloon(config, 1100, 400, 50, 7, 0.1);

    const points = [
      new Vector2(0, 0),
      new Vector2(300, 0),
      new Vector2(300, 300),
      new Vector2(0, 300)
    ];
    config.addPolygon(new Vector2(200, 400), 30, points);
    config.addPolygon(new Vector2(600, 400), -30, points);

    const p = config.particles;
    config.addDistanceConstraint(p[0], p[1], 1);
    config.addDistanceConstraint(p[0], p[5], 0.5);

    return config;
  }


  static createBox2x2(config, x, y, spacing, stiffness = 0) {
    const p0 = config.addParticle(x, y);
    const p1 = config.addParticle(x + spacing, y);
    const p2 = config.addParticle(x, y + spacing);
    const p3 = config.addParticle(x + spacing, y + spacing);

    config.addDistanceConstraint(p0, p1, stiffness);
    config.addDistanceConstraint(p0, p2, stiffness);
    config.addDistanceConstraint(p1, p3, stiffness);
    config.addDistanceConstraint(p2, p3, stiffness);
    config.addDistanceConstraint(p0, p3, stiffness);
    config.addDistanceConstraint(p1, p2, stiffness);
  }

  static createRope(config, x, y, count, spacing, stiffness = 0) {
    const start = config.particles.length;
    for (let i = 0; i < count; i++) {
      const isEnd = i === 0 || i === count - 1;
      const p = config.addParticle(
        x + i * spacing,
        y,
        isEnd ? 0 : config.mass,
        config.radius,
        isEnd ? '#16B4F2' : '#155FBF'
      );
    }
    for (let i = 0; i < count - 1; i++) {
      config.addDistanceConstraint(config.particles[start + i], config.particles[start + i + 1], stiffness);
    }
  }

  static createWheel(config, x, y, radius = 50, segments = 5, stiffness = 0) {
    const wheelParticles = [];
  
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      const p = config.addParticle(px, py);
      wheelParticles.push(p);
    }
  
    for (let i = 0; i < segments; i++) {
      const p1 = wheelParticles[i];
      const p2 = wheelParticles[(i + 1) % segments]; 
      config.addDistanceConstraint(p1, p2, stiffness);
    }
  
    const center = config.addParticle(x, y); // fixed center
    for (const p of wheelParticles) {
      config.addDistanceConstraint(center, p, stiffness);
    }

  }

  static createBalloon(config, x, y, radius = 50, segments = 5, stiffness = 0) {
    const balloonParticles = [];
  
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      const p = config.addParticle(px, py, config.mass, config.radius, '#16B4F2');
      balloonParticles.push(p);
    }

    const volumeConstraint = new VolumeConstraint(balloonParticles, 0.1, config.dts);
    config.volumeConstraints.push(volumeConstraint);
  
    for (let i = 0; i < segments; i++) {
      const p1 = balloonParticles[i];
      const p2 = balloonParticles[(i + 1) % segments]; 
      config.addDistanceConstraint(p1, p2, stiffness);
    }
  
    return balloonParticles;
  }
  

}
