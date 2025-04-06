import { Vector2 } from './Vector2.js';
import { Particle } from './Particle.js';
import { DistanceConstraint } from './DistanceConstraint.js';
import { Polygon } from './Polygon.js';

export class Scene {

    constructor() {
        this.dt = 0.002;
        this.substeps = 5;
        this.dts = this.dt / this.substeps;
        this.gravity = new Vector2(0, 9.8);
        this.multiplier = 100;
        this.mu = 0.3;

        this.particles = [];
        this.constraints = [];
        this.collisionConstraints = [];
        this.polygons = [];
        this.radius = 15;
        this.mass = 1;


        this.particles.push(new Particle(740, 100, 0, this.radius, '#155FBF'));
        this.createBox2x2(900, 100, 50, 0);
        this.createBox2x2(500, 250, 50, 0);
        this.createBox2x2(700, 250, 50, 0);
        this.createBox2x2(300, 250, 50, 0);
        this.createBox2x2(300, 100, 50, 0);
        this.createBox2x2(300, 400, 50, 0);
        
        

        this.createRope(200, 200, 10, 30, 0);
        


        this.points = [
            new Vector2(0, 0),
            new Vector2(300, 0),
            new Vector2(300, 300),
            new Vector2(0, 300)
        ];
        this.polygons.push(new Polygon(new Vector2(200, 400), 30, this.points));
        this.polygons.push(new Polygon(new Vector2(600, 400), -30, this.points));

        this.constraints.push(new DistanceConstraint(this.particles[0], this.particles[1], 1, this.dts));
        this.constraints.push(new DistanceConstraint(this.particles[0], this.particles[5], 0.5, this.dts));
        this.constraints.push(new DistanceConstraint(this.particles[0], this.particles[10], 0.1, this.dts));

    }

    //Factories -----------------------------------------------------------------------------------------------------------------------------------------
    createRope(x, y, number, space, stiffness = 0) {
        const startIndex = this.particles.length;

        for (let i = 0; i < number; i++) {

            if (i === 0 || i === number - 1)
                this.particles.push(new Particle(x + i * space, y, 0, this.radius, '#16B4F2'));
            else
                this.particles.push(new Particle(x + i * space, y, this.mass, this.radius, '#155FBF'));

        }

        for (let i = 0; i < number - 1; i++) {
            const p1 = this.particles[startIndex + i];
            const p2 = this.particles[startIndex + i + 1];
            this.constraints.push(new DistanceConstraint(p1, p2, stiffness, this.dts));
        }
    }
    createBox2x2(x, y, space, stiffness = 0) {
        const startIndex = this.particles.length;
        this.particles.push(new Particle(x, y, this.mass, this.radius));
        this.particles.push(new Particle(x + space, y, this.mass, this.radius));
        this.particles.push(new Particle(x, y + space, this.mass, this.radius));
        this.particles.push(new Particle(x + space, y + space, this.mass, this.radius));

        this.constraints.push(new DistanceConstraint(this.particles[startIndex], this.particles[startIndex + 1], stiffness, this.dts));
        this.constraints.push(new DistanceConstraint(this.particles[startIndex], this.particles[startIndex + 2], stiffness, this.dts));
        this.constraints.push(new DistanceConstraint(this.particles[startIndex + 1], this.particles[startIndex + 3], stiffness, this.dts));
        this.constraints.push(new DistanceConstraint(this.particles[startIndex + 2], this.particles[startIndex + 3], stiffness, this.dts));
        this.constraints.push(new DistanceConstraint(this.particles[startIndex], this.particles[startIndex + 3], stiffness, this.dts));
        this.constraints.push(new DistanceConstraint(this.particles[startIndex + 1], this.particles[startIndex + 2], stiffness, this.dts));
    }


}