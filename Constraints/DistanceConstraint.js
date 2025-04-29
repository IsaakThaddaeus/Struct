export class DistanceConstraint {

    constructor(particleA, particleB, stiffness = 1, damping = 0, config, color = '#F2B90F') {
        this.particleA = particleA;
        this.particleB = particleB;
        this.initialDistance = particleB.positionX.subtracted(particleA.positionX).length();
        this.stiffness = stiffness;
        this.damping = damping;
        this.config = config;
        this.color = color;
    }

    solve() {
        const x1 = this.particleA.positionX;
        const x2 = this.particleB.positionX;
        const x1n = this.particleA.positionP;
        const x2n = this.particleB.positionP;

        const deltaX = x2.subtracted(x1);
        const distance = deltaX.length();
        const n = deltaX.normalized();

        const c = distance - this.initialDistance;

        const alpha = this.stiffness / this.config.dts2;
        const beta = this.config.dts2 * this.damping;
        const gamma = (alpha * beta) / this.config.dts;

        const deltaV = x2.subtracted(x2n).subtracted(x1.subtracted(x1n)); // (x2 - x2n) - (x1 - x1n)
        const dampingTerm = gamma * n.dot(deltaV);

        const denominator = (1 + gamma) * (this.particleA.w + this.particleB.w) + alpha;
        const lambda = (-c - dampingTerm) / denominator;


        const correction = n.scaled(lambda);
        if (this.particleA.w !== 0)
            this.particleA.positionX = this.particleA.positionX.subtracted(correction.scaled(this.particleA.w));

        if (this.particleB.w !== 0)
            this.particleB.positionX = this.particleB.positionX.added(correction.scaled(this.particleB.w));
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.moveTo(this.particleA.positionX.x, this.particleA.positionX.y);
        ctx.lineTo(this.particleB.positionX.x, this.particleB.positionX.y);
        ctx.stroke();
    }


}