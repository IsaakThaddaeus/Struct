import { Vector2 } from './Vector2.js';
import { EnvironmentCollisionConstraint } from './EnvironmentCollisionConstraint.js';

export class XPBD {
    constructor(config) {
        this.config = config;
    }

    update() {
        const { substeps } = this.config;
        for (let i = 0; i < substeps; i++) {
            this.integrate();
            this.solveConstraints();
            this.handleCollisions();
            this.updateVelocities();
        }
    }

    render(ctx) {
        this.config.polygons.forEach(polygon => polygon.draw(ctx));
        this.config.constraints.forEach(constraint => constraint.draw(ctx));
        this.config.particles.forEach(particle => particle.draw(ctx));
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
        this.config.volumeConstraints.forEach(constraint => constraint.solve());
    }

    updateVelocities() {
        const { particles, dts, multiplier } = this.config;

        for (const particle of particles) {
            particle.velocity = particle.positionX.subtracted(particle.positionP).divided(dts * multiplier);
        }
    }

    
    handleCollisions() {
        const { particles } = this.config;
        for (const particle of particles) {
            this.boundaryCollision(particle);
            this.checkPolygonCollision(particle);
        }
        this.checkParticleCollision();
    }

    boundaryCollision(particle) {
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
            const constraint = new EnvironmentCollisionConstraint(particle, q, n, mu);
            constraint.solve();
        }
    }

    checkParticleCollision() {
        const { particles, radius } = this.config;

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const pa = particles[i];
                const pb = particles[j];

                const d = pb.positionX.subtracted(pa.positionX);
                const dist = d.length();

                if (dist < radius * 2) {
                    const n = d.normalized();
                    const c = dist - radius * 2;
                    const lambda = c / (pa.w + pb.w);
                    const correction = n.scaled(lambda);
                    pa.positionX = pa.positionX.added(correction.scaled(pa.w));
                    pb.positionX = pb.positionX.subtracted(correction.scaled(pb.w));
                }
            }
        }
    }

    checkPolygonCollision(particle) {
        const { polygons, mu } = this.config;

        for (const polygon of polygons) {
            if (this.pointInPolygon(particle.positionX, polygon)) {
                const cp = this.closestPointOnPolygon(particle.positionP, polygon);
                const constraint = new EnvironmentCollisionConstraint(particle, cp.closestPoint, cp.normal, mu);
                constraint.solve();
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
