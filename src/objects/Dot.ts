import * as PIXI from 'pixi.js';
import { Direction } from "../utils/Enums";
import { rotateVector } from '../utils/RotateVector';
import { rando } from '@nastyox/rando.js';

export class Dot extends PIXI.Sprite {
    public isRandom: boolean;
    public radius: number;
    private direction: Direction;

    private directionTimer: number;
    private aliveTimer: number;
    private maxAliveTimer: number;

    private horMaxTime: number;
    private ranMaxTime: number;

    private speed: number;
    private velocity: [number, number];

    constructor(
        x: number,
        y: number,
        radius: number,
        direction: Direction,
        aliveTime: number,
        texture: PIXI.Texture
    ) {
        super(texture);
        this.x = x;
        this.y = y;
        this.width = 2 * radius;
        this.height = 2 * radius;
        this.anchor.set(0.5);

        this.radius = radius;
        this.direction = direction;

        this.aliveTimer = aliveTime;
        this.maxAliveTimer = aliveTime;

        this.horMaxTime = 30; // TODO: get from settings
        this.ranMaxTime = 30; // TODO: get from settings
        this.speed = 0.2; // TODO: get from settings

        // calculate initial velocity vector
        if (this.direction === Direction.LEFT) {
            this.velocity = [-this.speed, 0];
        } else {
            this.velocity = [this.speed, 0];
        }
        if (this.direction === Direction.RANDOM) {
            this.velocity = rotateVector(this.velocity, rando() * 360);
            this.directionTimer = rando() * this.ranMaxTime;
            this.isRandom = true;
        } else {
            this.directionTimer = 0;
            this.isRandom = false;
        }
    }

    update = (delta: number): void => {
        // update timers
        this.directionTimer += delta;
        this.aliveTimer -= delta;

        // change velocity vector 180 degrees if the dot is moving left or right
        if (!this.isRandom && this.directionTimer >= this.horMaxTime) {
            this.velocity = rotateVector(this.velocity, 180);
            this.directionTimer = 0;
        }

        // change velocity vector by a random angle if dot is moving randomly
        if (this.isRandom && this.directionTimer >= this.ranMaxTime) {
            let randomAngle: number = rando() * 360;
            this.velocity = rotateVector(this.velocity, randomAngle);
            this.directionTimer = 0;
        }

        // update position
        this.updatePosition(delta);
    }

    updatePosition = (delta: number) => {
        this.x += delta * this.velocity[0];
        this.y += delta * this.velocity[1];
    }

    /**
     * Handles wall collision. 
     * @param wallX x position of the wall
     * @param wallY y position of the wall
     */
    collideWithWall = (wallX: number, wallY: number): void => {
        // Find a normal vector
        const n: [number, number] = [this.x - wallX, this.y - wallY];

        // Find distance
        const dist: number = Math.sqrt((n[0] ** 2) + (n[1] ** 2));

        // Find minimum translation distance
        const distScalar: number = (2 * this.radius - dist) / dist;
        const mtd: [number, number] = [n[0] * distScalar, n[1] * distScalar];

        // Push dot away from wall if overlapping
        this.x = this.x + (mtd[0] * 1 / 2);
        this.y = this.y + (mtd[1] * 1 / 2);

        // Flip velocity in x or y direction if wall type is vertical or horizontal, respectively
        if (mtd[0] != 0) {
            this.velocity[0] = -this.velocity[0]
        } else {
            this.velocity[1] = -this.velocity[1]
        }
    }

    /**
     * Calculates new velocities of two dots after collision and handles overlap.
     * Courtesy of Chen Shmilovich. See https://www.youtube.com/watch?v=w-qEL18afoY.
     * @param dot possibly colliding dot
     */
    collideWithDot = (dot: Dot): void => {
        // Don't check collision with itself
        if (dot == this) {
            return;
        }

        // Find a normal vector
        const n: [number, number] = [this.x - dot.x, this.y - dot.y]

        // Find distance
        const dist: number = Math.sqrt((n[0] ** 2) + (n[1] ** 2));

        // Return if dots are not colliding
        if (dist > 2 * this.radius) { //TODO: Get radius from global constant.
            return;
        }

        // Find minimum translation distance
        const distScalar: number = (2 * this.radius - dist) / dist;
        const mtd: [number, number] = [n[0] * distScalar, n[1] * distScalar];

        // Find unit normal vector
        const un: [number, number] = [n[0] * 1 / dist, n[1] * 1 / dist];

        // Find unit tangent vector
        const ut: [number, number] = [-un[1], un[0]];

        // Project velocities onto the unit normal and unit tangent vectors
        const v1n: number = un[0] * this.velocity[0] + un[1] * this.velocity[1];
        const v1t: number = ut[0] * this.velocity[0] + ut[1] * this.velocity[1];
        const v2n: number = un[0] * dot.velocity[0] + un[1] * dot.velocity[1];
        const v2t: number = ut[0] * dot.velocity[0] + ut[1] * dot.velocity[1];

        // Find new normal velocities
        let v1nPrime: number = v2n;
        let v2nPrime: number = v1n;

        // Convert the scalar normal and tangential velocities into vectors
        const v1nPrimeVector: [number, number] = [un[0] * v1nPrime, un[1] * v1nPrime];
        const v1tPrimeVector: [number, number] = [ut[0] * v1t, ut[1] * v1t];
        const v2nPrimeVector: [number, number] = [un[0] * v2nPrime, un[1] * v2nPrime];
        const v2tPrimeVector: [number, number] = [ut[0] * v2t, ut[1] * v2t];

        if (this.isRandom && !dot.isRandom) {
            // Push current dot away
            this.x = this.x + mtd[0];
            this.y = this.y + mtd[1];
            // Update current dot's velocity
            this.velocity = [v1nPrimeVector[0] + v1tPrimeVector[0], v1nPrimeVector[1] + v1tPrimeVector[1]];
        } else if (!this.isRandom && dot.isRandom) {
            // Push the other dot away
            dot.x = dot.x - mtd[0];
            dot.y = dot.y - mtd[1];
            // Update the other dot's velocity
            dot.velocity = [v2nPrimeVector[0] + v2tPrimeVector[0], v2nPrimeVector[1] + v2tPrimeVector[1]];
        } else {
            // Push-pull dots apart
            this.x = this.x + (mtd[0] * 1 / 2);
            this.y = this.y + (mtd[1] * 1 / 2);
            dot.x = dot.x - (mtd[0] * 1 / 2);
            dot.y = dot.y - (mtd[1] * 1 / 2);
            // Update velocities
            this.velocity = [v1nPrimeVector[0] + v1tPrimeVector[0], v1nPrimeVector[1] + v1tPrimeVector[1]];
            dot.velocity = [v2nPrimeVector[0] + v2tPrimeVector[0], v2nPrimeVector[1] + v2tPrimeVector[1]];
        }
    }

    // detectDotCollisions = (dots: Array<Dot>, delta: number): void => {
    //     dots.forEach(dot => {
    //         if (dot != this && euclideanDistance(this.x, this.y, dot.x, dot.y) <= (this.radius + dot.radius)) {
    //             this.updateVelocityAfterDotCollision(dot, delta);
    //         }
    //     })
    // }

    // /**
    //  * Updates dots' velocities after colliding.
    //  * Separate behavior for colliding with coherently-moving dots and randomly moving dots.
    //  * @param dot the dot collided with
    //  * @param delta time between each frame in ms
    //  */
    // updateVelocityAfterDotCollision = (dot: Dot, delta: number): void => {
    //     const newVelX1: number = dot.velocity[0];
    //     const newVelY1: number = dot.velocity[1];
    //     const newVelX2: number = this.velocity[0];
    //     const newVelY2: number = this.velocity[1];

    //     if (this.isRandom && !dot.isRandom) {
    //         this.velocity = [newVelX1, newVelY1]
    //         this.updatePosition(delta);
    //     } else if (!this.isRandom && dot.isRandom) {
    //         dot.velocity = rotateVector(dot.velocity, 180);
    //         dot.updatePosition(delta);
    //     } else if (this.isRandom && dot.isRandom) {
    //         this.velocity = [newVelX1, newVelY1];
    //         dot.velocity = [newVelX2, newVelY2];
    //         this.updatePosition(delta);
    //         dot.updatePosition(delta);
    //         // if overlapping after update
    //         if (euclideanDistance(this.x, this.y, dot.x, dot.y) < 2 * dot.radius) {
    //             this.handleWallCollision("VERTICAL", delta);
    //             this.handleWallCollision("HORIZONTAL", delta);
    //             dot.handleWallCollision("VERTICAL", delta);
    //             dot.handleWallCollision("HORIZONTAL", delta);
    //         }
    //     }
    // }
}