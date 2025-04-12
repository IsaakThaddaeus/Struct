// SceneBuilder.js
import { Config } from './Config.js';
import { Vector2 } from './Vector2.js';

export class SceneBuilder {
  static buildDefaultScene(canvas) {
    const config = new Config();
    config.setCanvas(canvas);

    config.addParticle(740, 100, 0);
    this.createBox2x2(config, 900, 100, 50);
    this.createBox2x2(config, 500, 250, 50);
    this.createBox2x2(config, 320, 250, 50);
    this.createBox2x2(config, 220, 300, 50);
    this.createBox2x2(config, 700, 250, 50);
    this.createBox2x2(config, 500, 100, 50);
    this.createBox2x2(config, 900, 200, 50);
    this.createRope(config, 200, 200, 20, 30);

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
    config.addDistanceConstraint(p[9], p[14], 1);

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
}
