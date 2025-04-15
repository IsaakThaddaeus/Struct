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
        // Mouse events
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));

        // Key press handling
        window.addEventListener('keydown', this.onKeyDown.bind(this));
    }


    onMouseDown(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const mousePos = new Vector2(x, y);

        for (const particle of this.config.particles) {
            const dist = particle.positionX.subtracted(mousePos).length();

            if (dist < particle.radius) {
                console.log('Particle clicked:', particle);
                this.selectedParticle = particle;
                return;
            }
        }

        const particle = new Particle(x, y, this.config.mass, this.config.radius);
        const vX = Math.random() * 10 - 5;
        const vY = Math.random() * 10 - 5;
        particle.velocity = new Vector2(vX, vY);
        this.config.particles.push(particle);


    }

    onMouseUp(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const mousePos = new Vector2(x, y);

        for (const particle of this.config.particles) {
            const dist = particle.positionX.subtracted(mousePos).length();

            if (dist < particle.radius && this.selectedParticle) {
                this.config.addDistanceConstraint(this.selectedParticle, particle, 0);
            }
        }

        this.selectedParticle = null;
    }

    onKeyDown(event) {
        if (event.code === 'Space') {
            event.preventDefault();
            this.config.paused = !this.config.paused;
        }
    }

    handleClick(event) {
    }

    edit() {
    }

}
