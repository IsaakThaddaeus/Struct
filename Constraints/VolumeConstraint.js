import { Vector2 } from '../Vector2.js';

export class VolumeConstraint {

    constructor(particles, stiffness = 1, dts, color = '#16B4F2') {
        this.particles = particles;
        this.initialArea = this.polygonArea(particles) * 1;
        this.alpha = stiffness / dts;
        this.color = color;
        console.log(this.initialArea);
    }

    // Gradient is incorrect — it must be perpendicular to the edge; otherwise, the simulation can blow up unless parameters are finely tuned
    solve() {

        let massSum = 0;
        const area = this.polygonArea(this.particles);
        const center = this.centerOfMass(this.particles);

        for (const particle of this.particles) {
            massSum += particle.w;
        }

        for (const particle of this.particles) {
            const n = particle.positionX.subtracted(center).normalized();
            const c =  area - this.initialArea;
            const lambda = -c / (massSum + this.alpha);
            const correction = n.scaled(lambda);
            particle.positionX = particle.positionX.added(correction.scaled(particle.w));
        }
    }

    draw(ctx) {

    }

    polygonArea(particles) {
        let area = 0;
        const n = particles.length;

        for (let i = 0; i < n; i++) {
            const x1 = particles[i].positionX;
            const x2 = particles[(i + 1) % n].positionX;
            area += (x1.x * x2.y - x2.x * x1.y);
        }

        return Math.abs(area) / 2;
    }

    centerOfMass(particles) {
        let center = new Vector2(0, 0);
        for (const particle of particles) {
            center = center.added(particle.positionX);
        }
        return center.divided(particles.length);
    }



}