import { Particle } from './Particle.js';
import { DistanceConstraint } from './Constraints/DistanceConstraint.js';
import { Vector2 } from './Vector2.js';

export class Editor {
    constructor(config, canvas) {
        this.config = config;
        this.canvas = canvas;

        this.selectedParticle = null;
        this.initEventListeners();
    }

    initEventListeners() {
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        window.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const mousePos = new Vector2(x, y);

        for (const particle of this.config.particles) {
            const dist = particle.positionX.subtracted(mousePos).length();

            if (dist < particle.radius) {
                if (this.selectedParticle && this.selectedParticle !== particle) {
                    this.config.addDistanceConstraint(this.selectedParticle, particle, 0);
                    this.selectedParticle = null; 
                } else {
                    this.selectedParticle = particle; 
                }
                return;
            }
        }

        const particle = new Particle(x, y, this.config.mass, this.config.radius);
        particle.velocity = new Vector2(Math.random() * 10 - 5, Math.random() * 10 - 5);
        this.config.particles.push(particle);
        this.selectedParticle = null;
    }

    onKeyDown(event) {
        if (event.code === 'Space') {
            event.preventDefault();
            this.config.paused = !this.config.paused;
        }
    }

    edit() { }
}
