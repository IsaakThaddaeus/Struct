import { Particle } from './Particle.js';
import { DistanceConstraint } from './DistanceConstraint.js';
import { Vector2 } from './Vector2.js';

export class Editor {
    constructor(config, canvas) {
        this.config = config;
        this.canvas = canvas;

        this._initEventListeners();
    }

    _initEventListeners() {
       this.canvas.addEventListener('click', this._handleClick.bind(this));
       this.canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
       this.canvas.addEventListener('mouseup', this._onMouseUp.bind(this));
    }


    _onMouseDown(event) {
        //console.log('mousedown', event);


    }

    _onMouseUp(event) {
        //console.log('mouseup', event);

        
    }

    
    _handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const particle = new Particle(x, y, this.config.mass, this.config.radius);

        const vX = Math.random() * 50 - 25;
        const vY = Math.random() * 50 - 25;
        particle.velocity = new Vector2(vX, vY);
        this.config.particles.push(particle);

    }
}
