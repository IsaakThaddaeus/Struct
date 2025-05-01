import { Vector2 } from '../Vector2.js';

export class MouseDistanceConstraint {

    constructor(particleA, mousePos, stiffness = 1, damping = 1, config, color = '#F2B90F') {
        this.particleA = particleA;
        this.mousePos = mousePos;
        this.stiffness = stiffness;
        this.damping = damping;
        this.config = config;
        this.color = color;
    }

    solve() {
        const x1 = this.particleA.positionX;
        const x1n = this.particleA.positionP;
        const x2 = this.mousePos;

        const deltaX = x2.subtracted(x1);
        const distance = deltaX.length();
        const n = deltaX.normalized();

        const c = distance;

        const alpha = this.stiffness / this.config.dts2;
        const beta = this.config.dts2 * this.damping;
        const gamma = (alpha * beta) / this.config.dts;

        const deltaV = x1.subtracted(x1n);
        const dampingTerm = gamma * -n.dot(deltaV);

        const denominator = (1 + gamma) * this.particleA.w + alpha;
        const lambda = (-c - dampingTerm) / denominator;

        const correction = n.scaled(lambda);
        if (this.particleA.w !== 0)
            this.particleA.positionX = this.particleA.positionX.subtracted(correction);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.moveTo(this.particleA.positionX.x, this.particleA.positionX.y);
        ctx.lineTo(this.mousePos.x, this.mousePos.y);
        ctx.stroke();
    }


}