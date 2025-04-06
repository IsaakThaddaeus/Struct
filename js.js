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
    }
    checkParticleCollision();
    

    //Update velocity
    for (let particle of particles) {
      particle.velocity = particle.positionX.subtracted(particle.positionP).devide(dts * 100);
    }

  }


  //Display Constraints
  for (let constraint of constraints) {
    constraint.draw(ctx);
  }
  //Display particles
  for (let particle of particles) {
    particle.draw(ctx);
  }



  requestAnimationFrame(draw);
}

draw();



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

        /*
        const nNew = particles[j].positionX.subtracted(particles[i].positionX).normalize();
        const t = new Vector2(-nNew.y, nNew.x);
        const particleIOffset = particles[i].positionX.subtracted(particles[i].positionP);
        const particleJOffset = particles[j].positionX.subtracted(particles[j].positionP);
        
        const deltaX = particleIOffset.subtracted(particleJOffset);
        const deltaXtangent = deltaX.dot(t);
        const deltaXOffset = n.scaled(deltaXtangent);

        particles[i].positionX = particles[i].positionX.subtracted(deltaXOffset.scaled(particles[i].w));
        particles[j].positionX = particles[j].positionX.added(deltaXOffset.scaled(particles[j].w));
        */
      }

    }

  }
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






