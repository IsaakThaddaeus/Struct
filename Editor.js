import { Particle } from './Particle.js';
import { DistanceConstraint } from './Constraints/DistanceConstraint.js';
import { MouseDistanceConstraint } from './Constraints/MouseDistanceConstraint.js';
import { Vector2 } from './Vector2.js';
import { SoundManager } from './SoundManager.js';


export class Editor {
    constructor(config) {
        this.config = config;

        this.mode = 'particle';
        this.selectedParticle = null;

        this.initEventListeners();
        this.initButtonListeners();
        this.initInputs();
    }

    initEventListeners() {
        this.config.canvas.addEventListener('click', this.handleClick.bind(this));
        this.config.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
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

    initInputs() {
        this.inputSubsteps = document.getElementById('substeps');
        this.inputGravity = document.getElementById('gravity');

        this.inputSubsteps.value = this.config.substeps;
        this.inputGravity.value = this.config.gravity.y.toFixed(2);

        this.inputSubsteps.addEventListener('input', () => this.updateSubsteps());
        this.inputGravity.addEventListener('input', () => this.updateGravity());
    }

    updateSubsteps() {
        const value = parseInt(this.inputSubsteps.value);
        if (!isNaN(value) && value > 0) {
            this.config.setDts(value);
        }
    }

    updateGravity() {
        const value = parseFloat(this.inputGravity.value);
        if (!isNaN(value)) {
            this.config.gravity.y = value;
        }
    }


    setMode(mode) {
        this.mode = mode;
        SoundManager.play('Sounds/FingerSnap.mp3');
        console.log("Switched mode to", mode);
    }

    handleClick(event) {
        const rect = this.config.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const mousePos = new Vector2(x, y);

        

        switch (this.mode) {
            case 'particle':
                this.config.addParticle(x, y);
                SoundManager.play('Sounds/Pop.mp3');
                break;

            case 'fixedParticle':
                this.config.addParticle(x, y, 0, undefined, '#155FBF');
                SoundManager.play('Sounds/Pop.mp3');
                break;

            case 'box':
                this.config.createBox2x2(x, y, 50, 0);
                SoundManager.play('Sounds/Pop.mp3');
                break;

            case 'wheel':
                this.config.createWheel(x, y, 50, 8, 0.0002);
                SoundManager.play('Sounds/Pop.mp3');
                break;

            case 'spring':
                this.handleConstraintClick(mousePos, 0.001, 20);
                break;

            case 'rod':
                this.handleConstraintClick(mousePos, 0, 0);
                break;

            case 'drag':
                this.handleDragClick(mousePos, 0.005, 20);
                break;
        }
    }

    handleConstraintClick(mousePos, stiffness, damping) {
        for (const particle of this.config.particles) {
            const dist = particle.positionX.subtracted(mousePos).length();
            if (dist < particle.radius) {
                if (this.selectedParticle && this.selectedParticle !== particle) {
                    this.config.addDistanceConstraint(this.selectedParticle, particle, stiffness, damping);
                    this.selectedParticle = null;
                } else {
                    this.selectedParticle = particle;
                }
                return;
            }
        }
        this.selectedParticle = null;
    }

    handleDragClick(mousePos, stiffness, damping) {
        for (const particle of this.config.particles) {
            const dist = particle.positionX.subtracted(mousePos).length();
            if (dist < particle.radius) {
                this.selectedParticle = particle;
                this.config.addMouseDistanceConstraint(particle, mousePos, stiffness, damping);
                return;
            }
        }
        this.selectedParticle = null;
        this.config.mouseConstraint = null;
    }

    handleMouseMove(event) {
        const rect = this.config.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const mousePos = new Vector2(x, y);

        if (this.config.mouseConstraint) {
            this.config.mouseConstraint.mousePos = mousePos;
        }
    }

    onKeyDown(event) {
        if (event.code === 'Space') {
            event.preventDefault();
            this.config.paused = !this.config.paused;
        }
    }
}
