export class DistanceConstraint {

    constructor(particleA, particleB, stiffness = 1, dts, color = '#F2B90F') {
        this.particleA = particleA;
        this.particleB = particleB;
        this.initialDistance = particleB.positionX.subtracted(particleA.positionX).length();
        this.alpha = stiffness / dts; //Account for devide infinite
        this.color = color;
    }

    solve() {
        const distance = this.particleB.positionX.subtracted(this.particleA.positionX).length();
        const c = distance - this.initialDistance;
        const n = this.particleB.positionX.subtracted(this.particleA.positionX).normalize();
        const lambda = c / (this.particleA.w + this.particleB.w + this.alpha);

        const correction = n.scaled(lambda);
        if (this.particleA.w !== 0)
            this.particleA.positionX = this.particleA.positionX.added(correction.scaled(this.particleA.w));

        if (this.particleB.w !== 0)
            this.particleB.positionX = this.particleB.positionX.subtracted(correction.scaled(this.particleB.w));
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