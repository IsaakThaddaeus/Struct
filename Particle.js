// Particle.js
import { Vector2 } from './Vector2.js';

export class Particle {
    constructor(x, y, m = 1, radius = 15, color = '#D91424') {
      this.positionP = new Vector2(x, y);
      this.positionX = new Vector2(x, y);
      this.velocity = new Vector2(0, 0);
      this.m = m;
      this.w = m === 0 ? 0 : 1 / m;
      this.radius = radius;
      this.color = color;
    }
  
    draw(ctx) {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.positionX.x, this.positionX.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  