import { Vector2 } from './Vector2.js';
import { EnvironmentCollisionConstraint } from './EnvironmentCollisionConstraint.js';


export class XPBDScene {
    constructor(config) {
        this.dt = config.dt ?? 0.002;
        this.substeps = config.substeps ?? 5;
        this.dts = this.dt / this.substeps;
        this.gravity = config.gravity ?? new Vector2(0, 9.81);
        this.multiplier = config.multiplier ?? 100;
        this.mu = config.mu ?? 0.3;

        this.particles = config.particles ?? [];
        this.constraints = config.constraints ?? [];
        this.polygons = config.polygons ?? [];

        this.radius = config.radius ?? 15;
        this.mass = config.mass ?? 1;

        this.canvas = config.canvas;
    }

    update() {
        for (let i = 0; i < this.substeps; i++) {
            this.integrate();
            this.solveConstraints();
            this.handleCollisions();
            this.updateVelocities();
        }
    }

    render(ctx) {
        this.polygons.forEach(polygon => polygon.draw(ctx));
        this.constraints.forEach(constraint => constraint.draw(ctx));
        this.particles.forEach(particle => particle.draw(ctx));
    }

    integrate() {
        for (const particle of this.particles) {
            const force = this.gravity.scaled(particle.m);
            const acceleration = force.scaled(particle.w);
            particle.velocity = particle.velocity.added(acceleration.scaled(this.dts * this.multiplier));
            particle.positionP = particle.positionX;
            particle.positionX = particle.positionX.added(particle.velocity.scaled(this.dts * this.multiplier));
        }
    }

    solveConstraints() {
        for (const constraint of this.constraints) {
            constraint.solve();
        }
    }

    updateVelocities() {
        for (const particle of this.particles) {
            particle.velocity = particle.positionX.subtracted(particle.positionP).divide(this.dts * this.multiplier);
        }
    }

    handleCollisions() {
        for (const particle of this.particles) {
            this.boundaryCollision(particle);
            this.checkPolygonCollision(particle);
        }
        this.checkParticleCollision();
    }

    boundaryCollision(particle) {
        if (!this.canvas) return;

        const { width, height } = this.canvas;

        if (particle.positionX.x > width - particle.radius)
            particle.positionX.x = width - particle.radius;

        if (particle.positionX.x < particle.radius)
            particle.positionX.x = particle.radius;

        if (particle.positionX.y < particle.radius)
            particle.positionX.y = particle.radius;

        if (particle.positionX.y > height - particle.radius) {
            const q = new Vector2(particle.positionP.x, height - particle.radius);
            const n = new Vector2(0, -1);
            const constraint = new EnvironmentCollisionConstraint(particle, q, n, this.mu);
            constraint.solve();
        }
    }

    checkParticleCollision() {
        const r = this.radius;
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const pa = this.particles[i];
                const pb = this.particles[j];

                const d = pb.positionX.subtracted(pa.positionX);
                const dist = d.length();

                if (dist < r * 2) {
                    const n = d.normalized();
                    const c = dist - r * 2;
                    const lambda = c / (pa.w + pb.w);
                    const correction = n.scaled(lambda);
                    pa.positionX = pa.positionX.added(correction.scaled(pa.w));
                    pb.positionX = pb.positionX.subtracted(correction.scaled(pb.w));
                }
            }
        }
    }

    checkPolygonCollision(particle) {
        for (const polygon of this.polygons) {
            if (this.pointInPolygon(particle.positionP, polygon)) {
                const cp = this.closestPointOnPolygon(particle.positionP, polygon);
                const constraint = new EnvironmentCollisionConstraint(particle, cp.closestPoint, cp.normal, this.mu);
                constraint.solve();
            }
        }
        /*
else{
  for (let i = 0; i < polygon.transformedPoints.length; i++) {
    const p1 = polygon.transformedPoints[i];
    const p2 = polygon.transformedPoints[(i + 1) % polygon.transformedPoints.length];
 
    const x1 = particle.positionP;
    const x2 = particle.positionX;

    const intersection = lineSegmentsIntersect(p1, p2, x1, x2);
    if (intersection) {
 
      const t = p1.subtracted(p2).normalize();
      const n = new Vector2(-t.y, t.x);
 
      const collisionConstraint = new EnviornmentCollisionConstraint(particle, intersection, n, mu);
      collisionConstraint.solve();
      console.log("collision");
    }
  }
}
*/
    }
    //https://wumbo.net/formulas/angle-between-two-vectors-2d/
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
    //t = (AP ⋅ AB) / (AB ⋅ AB)
    closestPointOnSegment(p, a, b) {
        const ap = p.subtracted(a);
        const ab = b.subtracted(a);

        const ab2 = ab.dot(ab);
        const ap_ab = ap.dot(ab);

        const t = ap_ab / ab2;

        if (t < 0 || t > 1) {
            return null;
        }

        return a.added(ab.scaled(t));
    }

    closestPointOnPolygon(p, polygon) {

        let closestPoint = null;
        let normal = null;
        let minDistance = Infinity;

        for (let i = 0; i < polygon.transformedPoints.length; i++) {
            const a = polygon.transformedPoints[i];
            const b = polygon.transformedPoints[(i + 1) % polygon.transformedPoints.length];

            let cp = this.closestPointOnSegment(p, a, b);
            if (cp) {
                const distance = p.subtracted(cp).length();
                if (distance < minDistance) {
                    minDistance = distance;
                    closestPoint = cp;
                    const t = a.subtracted(b).normalize();
                    normal = new Vector2(-t.y, t.x);
                }
            }
        }

        return { normal: normal, closestPoint: closestPoint };
    }

    lineSegmentsIntersect(p1, p2, q1, q2) {
        const r = p2.subtracted(p1);
        const s = q2.subtracted(q1);

        const crossRS = r.x * s.y - r.y * s.x;
        const q1_p1 = q1.subtracted(p1);
        const crossQ1P1R = q1_p1.x * r.y - q1_p1.y * r.x;

        if (crossRS === 0) {
            if (crossQ1P1R === 0) {
                return null;
            } else {
                return null;
            }
        }

        const t = (q1_p1.x * s.y - q1_p1.y * s.x) / crossRS;
        const u = (q1_p1.x * r.y - q1_p1.y * r.x) / crossRS;

        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            const intersection = p1.added(r.scaled(t));
            return intersection;
        } else {
            return null;
        }
    }


}
