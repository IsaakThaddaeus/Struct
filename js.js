import { Vector2 } from './Vector2.js';
import { Particle } from './Particle.js';
import { DistanceConstraint } from './DistanceConstraint.js';
import { EnviornmentCollisionConstraint } from './EnviornmentCollisionConstraint.js';
import { Polygon } from './Polygon.js';
import { Scene } from './Scene.js';



const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();


const scene = new Scene();
let particles = scene.particles;
let constraints = scene.constraints;
let polygons = scene.polygons;
const dts = scene.dts;
const substeps = scene.substeps;
const multiplier = scene.multiplier;
const mu = scene.mu;
const radius = scene.radius;
const mass = scene.mass;


//---------------------------------------------------------------------------------------------------------------------------------------------------



function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles = scene.particles;
  constraints = scene.constraints;

  for (let i = 0; i < substeps; i++) {

    //Integrate
    for (let particle of particles) {
      const force = new Vector2(0, 9.81).scaled(particle.m);
      const acceleration = force.scaled(particle.w);

      particle.velocity = particle.velocity.added(acceleration.scaled(dts * multiplier));
      particle.positionP = particle.positionX;
      particle.positionX = particle.positionX.added(particle.velocity.scaled(dts * multiplier));
    }

    //Solve Constraints
    for (let constraint of constraints) {
      constraint.solve();
    }

    for (let particle of particles) {
      boundaryCollision(particle);
      checkPolygonCollision(particle);
    }
    checkParticleCollision();


    //Update velocity
    for (let particle of particles) {
      particle.velocity = particle.positionX.subtracted(particle.positionP).devide(dts * 100);
    }

  }

  drawObjects();
  requestAnimationFrame(draw);
}

draw();

//Draw Objects ---------------------------------------------------------------------------------------------------------------------------------------
function drawObjects() {

  for (let polygon of polygons) {
    polygon.draw(ctx);
  }

  for (let constraint of constraints) {
    constraint.draw(ctx);
  }

  for (let particle of particles) {
    particle.draw(ctx);
  }
}


//Collisions -----------------------------------------------------------------------------------------------------------------------------------------
function boundaryCollision(particle) {
  if (particle.positionX.x > canvas.width - particle.radius) {
    particle.positionX.x = canvas.width - particle.radius;
  }
  if (particle.positionX.x < particle.radius) {
    particle.positionX.x = particle.radius;
  }
  if (particle.positionX.y < particle.radius) {
    particle.positionX.y = particle.radius;
  }

  //Static collision detection
  if (particle.positionX.y > canvas.height - particle.radius) {
    const collisionConstraint = new EnviornmentCollisionConstraint(particle, new Vector2(particle.positionP.x, canvas.height - particle.radius), new Vector2(0, -1), mu);
    collisionConstraint.solve();
  }


}
function checkParticleCollision() {

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {

      const distance = particles[j].positionX.subtracted(particles[i].positionX).length();

      if (distance < particles[i].radius * 2) {
        const n = particles[j].positionX.subtracted(particles[i].positionX).normalize();
        const c = particles[j].positionX.subtracted(particles[i].positionX).length() - radius * 2;
        const lambda = c / (particles[i].w + particles[j].w);
        const correction = n.scaled(lambda);
        particles[i].positionX = particles[i].positionX.added(correction.scaled(particles[i].w));
        particles[j].positionX = particles[j].positionX.subtracted(correction.scaled(particles[j].w));
      }
    }
  }
}

function checkPolygonCollision(particle) {
  for (let polygon of polygons) {

    //Check if particle is inside polygon
    if (pointInPolygon(particle.positionP, polygon)) {
      const cp = closestPointOnPolygon(particle.positionP, polygon);
      const n = cp.normal;
      const collisionConstraint = new EnviornmentCollisionConstraint(particle, cp.closestPoint, n, mu);
      collisionConstraint.solve();
      console.log("inside");
      console.log(particle.positionX);
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

}
//https://wumbo.net/formulas/angle-between-two-vectors-2d/
function pointInPolygon(point, polygon) {
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
function closestPointOnSegment(p, a, b) {
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

function closestPointOnPolygon(p, polygon) {

  let closestPoint = null;
  let normal = null;
  let minDistance = Infinity;

  for (let i = 0; i < polygon.transformedPoints.length; i++) {
    const a = polygon.transformedPoints[i];
    const b = polygon.transformedPoints[(i + 1) % polygon.transformedPoints.length];

    let cp = closestPointOnSegment(p, a, b);
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

function lineSegmentsIntersect(p1, p2, q1, q2) {
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

//Debugging -------------------------------------------------------------------------------------------------------------------------------------------
/*
const cp = closestPointOnPolygon(particle.positionX, scene.polygons[0]);
if (cp.closestPoint) {
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(cp.closestPoint.x, cp.closestPoint.y, 10, 0, Math.PI * 2);
  ctx.fill();
}
  */









