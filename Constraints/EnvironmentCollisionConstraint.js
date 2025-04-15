import { Vector2 } from '../Vector2.js';

export class EnvironmentCollisionConstraint {

    constructor(particle, q, n, mu) {
        this.particle = particle;
        this.q = q;
        this.n = n;
        this.mu = mu;
    }

    solve() {
        const t = new Vector2(-this.n.y, this.n.x);
        const difference = this.particle.positionX.subtracted(this.q);
        const cColl = this.n.dot(difference);
        const cFric = t.dot(difference);
        const lambdaColl = -cColl;
        const lambdaFric = -cFric;

        const limit = Math.abs(this.mu * lambdaColl);
        const lambdaFricClamped = Math.max(-limit, Math.min(limit, lambdaFric)); //Further investigation could help refine or optimize this method.

        this.particle.positionX = this.particle.positionX.added(this.n.scaled(lambdaColl));
        this.particle.positionX = this.particle.positionX.added(t.scaled(lambdaFricClamped));
    }

}