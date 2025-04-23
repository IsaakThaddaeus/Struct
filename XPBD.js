import { CollisionDetector } from './CollisionDetector.js';

export class XPBD {
    constructor(config) {
        this.config = config;
        this.collisionDetector = new CollisionDetector(config);
    }

    update() {
        const { substeps, paused } = this.config;
        if(paused) return;
        
        for (let i = 0; i < substeps; i++) {
            this.integrate();
            this.solveConstraints();
            this.collisionDetector.findCollisions();
            this.solveCollisionConstraints();
            this.updateVelocities();
        }
    }

    integrate() {
        const { particles, gravity, dts, multiplier } = this.config;

        for (const particle of particles) {
            const force = gravity.scaled(particle.m);
            const acceleration = force.scaled(particle.w);
            particle.velocity = particle.velocity.added(acceleration.scaled(dts * multiplier));
            particle.positionP = particle.positionX;
            particle.positionX = particle.positionX.added(particle.velocity.scaled(dts * multiplier));
        }
    }

    solveConstraints() {
        this.config.constraints.forEach(constraint => constraint.solve());
        if(this.config.mouseConstraint) { this.config.mouseConstraint.solve(); }
    }

    solveCollisionConstraints() {
        this.config.environmentCollisionConstraints.forEach(constraint => constraint.solve());
    }

    updateVelocities() {
        const { particles, dts, multiplier } = this.config;

        for (const particle of particles) {
            particle.velocity = particle.positionX.subtracted(particle.positionP).divided(dts * multiplier);
        }
    }
}
