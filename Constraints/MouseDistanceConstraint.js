import { Vector2 } from '../Vector2.js';

export class MouseDistanceConstraint {

    constructor(particleA, mousePos, stiffness = 1, dts, color = '#F2B90F') {
        this.particleA = particleA;
        this.mousePos = mousePos;
        this.alpha = stiffness / dts; //Account for devide infinite
        this.color = color;
    }

    solve() {
        const c = this.mousePos.subtracted(this.particleA.positionX).length();
        const n = this.mousePos.subtracted(this.particleA.positionX).normalized();
        const lambda = c / this.alpha;

        const correction = n.scaled(lambda);
        if (this.particleA.w !== 0)
            this.particleA.positionX = this.particleA.positionX.added(correction);

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