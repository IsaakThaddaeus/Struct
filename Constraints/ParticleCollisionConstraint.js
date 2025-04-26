import { Vector2 } from '../Vector2.js';

export class ParticleCollisionConstraint {
    constructor(particleA, particleB, n, penetration, muS, muK) {
        this.particleA = particleA;
        this.particleB = particleB;
        this.n = n;
        this.penetration = penetration;
        this.muS = muS;
        this.muK = muK;
    }

    solve() {
        const { particleA, particleB, n, penetration, muS, muK } = this;

        // 1) Tangential unit vector
        const t = new Vector2(-n.y, n.x);

        // 2) Normal correction
        const invSum = particleA.w + particleB.w;
        if (invSum === 0) return; // Both are immovable

        const normalCorrection = n.scaled(penetration / invSum);
        particleA.positionX = particleA.positionX.subtracted(normalCorrection.scaled(particleA.w));
        particleB.positionX = particleB.positionX.added(normalCorrection.scaled(particleB.w));

        // 3) Relative tangential motion since last step
        const deltaA = particleA.positionX.subtracted(particleA.positionP);
        const deltaB = particleB.positionX.subtracted(particleB.positionP);
        const relTan = t.dot(deltaA.subtracted(deltaB));
        const absTan = Math.abs(relTan);

        // 4) Friction magnitude (static vs kinetic)
        let fricMag;
        if (absTan < muS * penetration) {
            // Static friction: exactly oppose tangential motion
            fricMag = -relTan;
        } else {
            // Kinetic friction: cap at muK * penetration
            fricMag = -Math.sign(relTan) * muK * penetration;
        }

        // 5) Apply friction correction
        const frictionCorrection = t.scaled(fricMag / invSum);
        particleA.positionX = particleA.positionX.added(frictionCorrection.scaled(particleA.w));
        particleB.positionX = particleB.positionX.subtracted(frictionCorrection.scaled(particleB.w));
    }

}