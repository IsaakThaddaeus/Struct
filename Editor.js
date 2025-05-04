import { Vector2 } from './Vector2.js';
import { SoundManager } from './SoundManager.js';

export class Editor {
    constructor(config) {
        this.config = config;

        this.mode = 'particle';
        this.constraintParticle = null;
        this.soundManager = new SoundManager();

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
        this.inputMuEnv = document.getElementById('muEnv');
        this.inputMuSp  = document.getElementById('muSp');
        this.inputMuKp  = document.getElementById('muKp');

        this.inputSubsteps.value = this.config.substeps;
        this.inputGravity.value = this.config.gravity.y.toFixed(2);
        this.inputMuEnv.value = this.config.mu?.toFixed(2)  ?? '0.00';
        this.inputMuSp.value  = this.config.muSp?.toFixed(2) ?? '0.00';
        this.inputMuKp.value  = this.config.muKp?.toFixed(2) ?? '0.00';

        this.inputSubsteps.addEventListener('input', () => this.updateSubsteps());
        this.inputGravity.addEventListener('input', () => this.updateGravity());
        this.inputMuEnv.addEventListener('input', () => this.updateMuEnv());
        this.inputMuSp.addEventListener('input', () => this.updateMuSP());
        this.inputMuKp.addEventListener('input', () => this.updateMuKP());
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

    updateMuEnv() {
        const v = parseFloat(this.inputMuEnv.value);
        if (!isNaN(v) && v >= 0) {
            this.config.mu = v;
        }
    }

    updateMuSP() {
        const v = parseFloat(this.inputMuSp.value);
        if (!isNaN(v) && v >= 0) {
            this.config.muSp = v;
        }
    }

    updateMuKP() {
        const v = parseFloat(this.inputMuKp.value);
        if (!isNaN(v) && v >= 0) {
            this.config.muKp = v;
        }
    }


    setMode(mode) {
        this.soundManager.playSelect();
        this.mode = mode;
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
                this.soundManager.playPop();
                break;

            case 'fixedParticle':
                this.config.addParticle(x, y, 0, undefined, '#155FBF');
                this.soundManager.playPop();
                break;

            case 'box':
                this.config.createBox2x2(x, y, 50, 0);
                this.soundManager.playPop();
                break;

            case 'wheel':
                this.config.createWheel(x, y, 50, 8, 0.0002);
                this.soundManager.playPop();
                break;

            case 'spring':
                this.handleConstraintClick(mousePos, 0.001, 10, '#16B4F2');
                break;

            case 'rod':
                this.handleConstraintClick(mousePos, 0, 0);
                break;

            case 'drag':
                this.handleDragClick(mousePos, 0.005, 15, '#16B4F2');
                break;

        }
    }

    handleConstraintClick(mousePos, stiffness, damping, color) {
        for (const particle of this.config.particles) {
            const dist = particle.positionX.subtracted(mousePos).length();
            if (dist < particle.radius) {
                if (this.constraintParticle && this.constraintParticle !== particle) {
                    this.soundManager.playSpring();
                    this.config.addDistanceConstraint(this.constraintParticle, particle, stiffness, damping, color);
                    this.constraintParticle = null;
                } else {
                    this.constraintParticle = particle;
                }
                return;
            }
        }
        this.constraintParticle = null;
    }

    handleDragClick(mousePos, stiffness, damping, color) {
        for (const particle of this.config.particles) {
            const dist = particle.positionX.subtracted(mousePos).length();
            if (dist < particle.radius) {
                this.soundManager.playSpring();
                this.constraintParticle = particle;
                this.config.addMouseDistanceConstraint(particle, mousePos, stiffness, damping, color);
                return;
            }
        }

        if(this.config.mouseConstraint)
            this.soundManager.playSpringBackwards();

        this.constraintParticle = null;
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
    
            const canvas = document.getElementById('simulationCanvas');
    
            if (this.config.paused) {
                this.soundManager.playPlay();
                canvas.style.backgroundColor = '#ffffff'; 
            } else {
                this.soundManager.playPause();
                canvas.style.backgroundColor = '#f0f0f0';
            }
    
            this.config.paused = !this.config.paused;
        }
    }
    
}
