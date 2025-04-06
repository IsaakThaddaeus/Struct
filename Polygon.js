import { Vector2 } from './Vector2.js';

export class Polygon {

    constructor(position, rotation, points = [], color = '#F2A30F') {
        this.position = position;
        this.rotation = rotation;
        this.points = points;
        this.color = color;
        this.transformedPoints = this.transfomPoints();
    }

    rotate(rotation) {
        this.rotation = rotation;
        this.transformedPoints = this.transfomPoints();
    }

    translation(position) {
        this.position = position;
        this.transformedPoints = this.transfomPoints();
    }


    transfomPoints() {
        const transformedPoints = [];
        for (let point of this.points) {

            let transformedPoint = point.rotateDeg(this.rotation);
            transformedPoint = transformedPoint.added(this.position);
            transformedPoints.push(transformedPoint);
        }

        return transformedPoints;
    }

    draw(ctx) {
        if (this.points.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(this.transformedPoints[0].x, this.transformedPoints[0].y);
        for (let i = 1; i < this.transformedPoints.length; i++) {
            ctx.lineTo(this.transformedPoints[i].x, this.transformedPoints[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
    }




}