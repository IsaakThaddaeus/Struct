export class Vector2 {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
  

    added(v) {
      return new Vector2(this.x + v.x, this.y + v.y);
    }
  
    subtracted(v) {
      return new Vector2(this.x - v.x, this.y - v.y);
    }
  
    scaled(scalar) {
      return new Vector2(this.x * scalar, this.y * scalar);
    }

    divided(scalar) {
        return new Vector2(this.x / scalar, this.y / scalar);
      }
  
    normalized() {
      const len = this.length();
      return len > 0 ? this.scaled(1 / len) : new Vector2();
    }
  
    // ----- Other -----
  
    dot(v) {
      return this.x * v.x + this.y * v.y;
    }
  
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
  
    distanceTo(v) {
      const dx = this.x - v.x;
      const dy = this.y - v.y;
      return Math.sqrt(dx * dx + dy * dy);
    }
  
    clone() {
      return new Vector2(this.x, this.y);
    }
  
    toString() {
      return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
    }
    
    rotateRad(angleInRadians) {
      const cos = Math.cos(angleInRadians);
      const sin = Math.sin(angleInRadians);
    
      const xRotated = this.x * cos - this.y * sin;
      const yRotated = this.x * sin + this.y * cos;
    
      return new Vector2(xRotated, yRotated);
    }

    rotateDeg(angleInDegrees) {
      const angleInRadians = angleInDegrees * (Math.PI / 180);
      const cos = Math.cos(angleInRadians);
      const sin = Math.sin(angleInRadians);
    
      const xRotated = this.x * cos - this.y * sin;
      const yRotated = this.x * sin + this.y * cos;
    
      return new Vector2(xRotated, yRotated);
    }
    
    
  }
  