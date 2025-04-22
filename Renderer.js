
export class Renderer {
    constructor(config) {
        this.config = config;
    }

    render(ctx) {
        this.config.polygons.forEach(polygon => polygon.draw(ctx));
        this.config.constraints.forEach(constraint => constraint.draw(ctx));
        if(this.config.mouseConstraint) { this.config.mouseConstraint.draw(ctx);}
        this.config.particles.forEach(particle => particle.draw(ctx));
        
    }
}