// SceneBuilder.js
import { Config } from './Config.js';
import { Vector2 } from './Vector2.js';

export class SceneBuilder {
  static buildDefaultScene(canvas) {
    const config = new Config();
    config.setCanvas(canvas);

    config.addParticle(800, 100, 0, config.radius, '#16B4F2');
    config.createBox2x2(900, 100, 50);
    config.createBox2x2(500, 250, 50);
    config.createBox2x2(700, 250, 50);
    config.createBox2x2(500, 50, 50);
    config.createRope(200, 150, 20, 30);
    config.createWheel(300, 250, 55, 8, 0.01);
    config.createWheel(1100, 200, 55, 8, 0.01);

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

  static buildEmptyScene(canvas) {
    const config = new Config();
    config.setCanvas(canvas);

    const points = [
      new Vector2(0, 0),
      new Vector2(300, 0),
      new Vector2(300, 300),
      new Vector2(0, 300)
    ];
    config.addPolygon(new Vector2(25, 400), -30, points);

    return config;
  }
}
