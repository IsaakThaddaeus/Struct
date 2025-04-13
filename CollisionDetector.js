import { Vector2 } from './Vector2.js';
import { EnvironmentCollisionConstraint } from './EnvironmentCollisionConstraint.js';

export class CollisionDetector {
    constructor(config) {
        this.config = config;
    }

    findCollisions() {
        const { particles } = this.config;
        this.config.environmentCollisionConstraints = [];

        for (const particle of particles) {
            this.checkBoundaryCollision(particle);
            this.checkPolygonCollision(particle);
            this.checkAndSolveParticleCollision(particle);
        }
    }

    // Solving collision constraints immediately upon detection improves simulation stability 
    // compared to solving them all together at the end of the simulation step.
    checkAndSolveParticleCollision(particleA) {
        const { particles, radius } = this.config;

        for (const particleB of particles) {
            if (particleA === particleB) continue;

            const d = particleB.positionX.subtracted(particleA.positionX);
            const dist = d.length();

            if (dist < radius * 2) {
                const n = d.normalized();
                const c = dist - radius * 2;
                const lambda = c / (particleA.w + particleB.w);
                const correction = n.scaled(lambda);
                particleA.positionX = particleA.positionX.added(correction.scaled(particleA.w));
                particleB.positionX = particleB.positionX.subtracted(correction.scaled(particleB.w));
            }
        }
    }

    checkBoundaryCollision(particle) {
        const { canvas, mu } = this.config;
        if (!canvas) return;

        const { width, height } = canvas;

        if (particle.positionX.x > width - particle.radius)
            particle.positionX.x = width - particle.radius;

        if (particle.positionX.x < particle.radius)
            particle.positionX.x = particle.radius;

        if (particle.positionX.y < particle.radius)
            particle.positionX.y = particle.radius;

        if (particle.positionX.y > height - particle.radius) {
            const q = new Vector2(particle.positionP.x, height - particle.radius);
            const n = new Vector2(0, -1);
            this.config.addEnvironmentCollisionConstraint(particle, q, n);
        }
    }

    checkPolygonCollision(particle) {
        const { polygons, mu } = this.config;

        for (const polygon of polygons) {
            if (this.pointInPolygon(particle.positionX, polygon)) {
                const cp = this.closestPointOnPolygon(particle.positionP, polygon);
                if (!cp) continue;
                this.config.addEnvironmentCollisionConstraint(particle, cp.closestPoint, cp.normal);
            }
        }
    }

    pointInPolygon(point, polygon) {
        let totalAngle = 0;

        for (let i = 0; i < polygon.transformedPoints.length; i++) {
            const a = polygon.transformedPoints[i];
            const b = polygon.transformedPoints[(i + 1) % polygon.transformedPoints.length];

            const v1 = a.subtracted(point);
            const v2 = b.subtracted(point);

            const dot = v1.x * v2.x + v1.y * v2.y;
            const det = v1.x * v2.y - v1.y * v2.x;
            const angle = Math.atan2(det, dot);

            totalAngle += angle;
        }

        return Math.abs(totalAngle) > 1e-6;
    }

    closestPointOnSegment(p, a, b) {
        const ap = p.subtracted(a);
        const ab = b.subtracted(a);

        const ab2 = ab.dot(ab);
        const ap_ab = ap.dot(ab);

        const t = ap_ab / ab2;

        if (t < 0 || t > 1) return null;

        return a.added(ab.scaled(t));
    }

    closestPointOnPolygon(p, polygon) {
        let closestPoint = null;
        let normal = null;
        let minDistance = Infinity;

        for (let i = 0; i < polygon.transformedPoints.length; i++) {
            const a = polygon.transformedPoints[i];
            const b = polygon.transformedPoints[(i + 1) % polygon.transformedPoints.length];

            const cp = this.closestPointOnSegment(p, a, b);
            if (cp) {
                const distance = p.subtracted(cp).length();
                if (distance < minDistance) {
                    minDistance = distance;
                    closestPoint = cp;
                    const t = a.subtracted(b).normalized();
                    normal = new Vector2(-t.y, t.x);
                }
            }
        }

        return { normal, closestPoint };
    }

    lineSegmentsIntersect(p1, p2, q1, q2) {
        const r = p2.subtracted(p1);
        const s = q2.subtracted(q1);

        const crossRS = r.x * s.y - r.y * s.x;
        const q1_p1 = q1.subtracted(p1);
        const crossQ1P1R = q1_p1.x * r.y - q1_p1.y * r.x;

        if (crossRS === 0) return null;

        const t = (q1_p1.x * s.y - q1_p1.y * s.x) / crossRS;
        const u = (q1_p1.x * r.y - q1_p1.y * r.x) / crossRS;

        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return p1.added(r.scaled(t));
        }

        return null;
    }
}
