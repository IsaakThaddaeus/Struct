import { Particle } from './Particle.js';
import { DistanceConstraint } from './Constraints/DistanceConstraint.js';
import { MouseDistanceConstraint } from './Constraints/MouseDistanceConstraint.js';
import { Vector2 } from './Vector2.js';

export class Editor {
    constructor(config, canvas) {
        this.config = config;
        this.canvas = canvas;

        this.mode = 'particle';
        this.selectedParticle = null;
        this.dragging = false;

        this.initEventListeners();
        this.initButtonListeners();
    }

    initEventListeners() {
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    initButtonListeners() {
        document.getElementById('btn-drag').addEventListener('click', () => this.setMode('drag'));
        document.getElementById('btn-particle').addEventListener('click', () => this.setMode('particle'));
        document.getElementById('btn-fixed-particle').addEventListener('click', () => this.setMode('fixedParticle'));
        document.getElementById('btn-box').addEventListener('click', () => this.setMode('box'));
        document.getElementById('btn-wheel').addEventListener('click', () => this.setMode('wheel'));
        document.getElementById('btn-rod').addEventListener('click', () => this.setMode('rod'));
        document.getElementById('btn-spring').addEventListener('click', () => this.setMode('spring'));
    }

    setMode(mode) {
        this.mode = mode;
        console.log("Switched mode to", mode);
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const mousePos = new Vector2(x, y);

        switch (this.mode) {
            case 'particle':
                this.config.addParticle(x, y);
                break;

            case 'fixedParticle':
                this.config.addParticle(x, y, 0, this.config.radius, '#155FBF');
                break;

            case 'box':
                this.config.createBox2x2(x, y, 50, 0);
                break;

            case 'wheel':
                this.config.createWheel(x, y, 50, 8, 0.01);
                break;

            case 'spring':
                for (const particle of this.config.particles) {
                    const dist = particle.positionX.subtracted(mousePos).length();

                    if (dist < particle.radius) {
                        if (this.selectedParticle && this.selectedParticle !== particle) {
                            this.config.addDistanceConstraint(this.selectedParticle, particle, 0.1);
                            this.selectedParticle = null;
                        } else {
                            this.selectedParticle = particle;
                        }
                        return;
                    }
                }

                this.selectedParticle = null;
                break;

            case 'rod':
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

                this.selectedParticle = null;
                break;

            case 'drag':
                if (!this.dragging) {
                    for (const particle of this.config.particles) {
                        const dist = particle.positionX.subtracted(mousePos).length();

                        if (dist < particle.radius) {
                            this.selectedParticle = particle;
                            this.dragging = true;
                            const mouseConstraint = new MouseDistanceConstraint(particle, mousePos, 0.3, this.config.dts);
                            this.config.mouseConstraints.push(mouseConstraint);
                            return;
                        }
                    }
                }

                this.dragging = false;
                this.selectedParticle = null;
                this.config.mouseConstraints = [];
                break;
        }
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const mousePos = new Vector2(x, y);

        this.config.mouseConstraints.forEach(constraint => {
            constraint.mousePos = mousePos;
        });
    }


    onKeyDown(event) {
        if (event.code === 'Space') {
            event.preventDefault();
            this.config.paused = !this.config.paused;
        }
    }




    edit() { }
}
