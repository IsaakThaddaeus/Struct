import { Particle } from './Particle.js';
import { DistanceConstraint } from './DistanceConstraint.js';
import { Vector2 } from './Vector2.js';

export class Editor {
    constructor(config, canvas) {
        this.config = config;
        this.canvas = canvas;

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
        console.log('mousedown', event);


    }

    onMouseUp(event) {
        console.log('mouseup', event);

        
    }

    onKeyDown(event) {
        if (event.code === 'Space') {
            event.preventDefault();
            this.config.paused = !this.config.paused;
        }
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const particle = new Particle(x, y, this.config.mass, this.config.radius);

        const vX = Math.random() * 10 - 5;
        const vY = Math.random() * 10 - 5;
        particle.velocity = new Vector2(vX, vY);
        this.config.particles.push(particle);

    }

    edit() {


    }
}
