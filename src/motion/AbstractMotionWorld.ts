import { Dot } from "../objects/Dot";
import { Patch } from "../objects/Patch";
import * as PIXI from "pixi.js";
import { euclideanDistance } from "../utils/EuclideanDistance";
import { QuadTree } from "../utils/QuadTree";
import { rando } from "@nastyox/rando.js";
import { WorldState } from "../utils/Enums";
import { PATCH_OUTLINE_THICKNESS } from "../utils/Constants";
import { Settings } from "../utils/Settings";

export abstract class AbstractMotionWorld extends PIXI.Container {
    protected currentState: WorldState;

    public dotsLeftContainer: PIXI.Container = new PIXI.Container();
    public dotsRightContainer: PIXI.Container = new PIXI.Container();
    public dotsLeftParticleContainer: PIXI.ParticleContainer = new PIXI.ParticleContainer();
    public dotsRightParticleContainer: PIXI.ParticleContainer = new PIXI.ParticleContainer();
    public dotsLeft: Array<Dot>;
    public dotsRight: Array<Dot>;

    public patchLeft: Patch;
    public patchRight: Patch;
    public patchLeftMask: PIXI.Graphics;
    public patchRightMask: PIXI.Graphics;
    public patchGap: number;

    protected leftMinX: number;
    protected leftMaxX: number;

    protected patchMinY: number;
    protected patchMaxY: number;

    protected rightMinX: number;
    protected rightMaxX: number;

    protected coherentPatchSide: string;

    protected coherencePercent: number;
    protected dotKillPercentage: number;

    protected numberOfDots: number;
    protected dotSpacing: number;
    protected dotRadius: number;
    protected dotMaxAliveTime: number;

    protected maxRunTime: number;
    protected runTime: number;

    protected correctAnswerFactor: number;
    protected wrongAnswerFactor: number;

    protected quadTree: QuadTree;

    constructor() {
        super();
        this.currentState = WorldState.RUNNING;

        this.runTime = 0;

        this.dotsLeft = new Array<Dot>();
        this.dotsRight = new Array<Dot>();

        this.coherencePercent = Settings.DOT_COHERENCE_PERCENTAGE;
        this.dotKillPercentage = Settings.DOT_KILL_PERCENTAGE;

        this.numberOfDots = Settings.DOT_TOTAL_AMOUNT;
        this.dotRadius = Settings.DOT_RADIUS;
        this.dotSpacing = Settings.DOT_SPACING;
        this.maxRunTime = Settings.DOT_MAX_ANIMATION_TIME;
        this.dotMaxAliveTime = Settings.DOT_MAX_ALIVE_TIME;

        // use particle container for faster rendering. 
        this.dotsLeftContainer.addChild(this.dotsLeftParticleContainer);
        this.dotsRightContainer.addChild(this.dotsRightParticleContainer);
    }

    abstract update(delta: number): void;

    abstract createPatches(): void;

    abstract createDots(): void;

    abstract updateCoherency(factor: number, isCorrectAnswer: boolean): void;

    destroyDots = (): void => {
        this.dotsLeft.forEach(dot => dot.destroy());
        this.dotsRight.forEach(dot => dot.destroy());
    }

    reset = (): void => {
        this.runTime = 0;
        if (this.dotsLeft.length > 0 && this.dotsRight.length > 0) {
            this.destroyDots();
        }
        this.dotsLeft = [];
        this.dotsRight = [];
        this.createDots();
    }

    paused = (): void => {
        if (this.runTime >= this.maxRunTime) {
            this.runTime = 0;
            this.destroyDots();
            this.dotsLeft = [];
            this.dotsRight = [];
        }
    }

    /**
     * Draws the bounds of a quadtree and all its nodes. For debugging purposes.
     * @param quadTree the quadtree to draw.
     */
    debugQuadTree = (quadTree: QuadTree): void => {
        let bounds: PIXI.Rectangle = quadTree.getBounds();
        let nodes: Array<QuadTree | null> = quadTree.getNodes();

        const rect: PIXI.Graphics = new PIXI.Graphics();
        rect.position.set(bounds.x, bounds.y)
        rect.lineStyle(1, 0xFF00FF)
            .lineTo(bounds.width, 0)
            .lineTo(bounds.width, bounds.height)
            .lineTo(0, bounds.height)
            .lineTo(0, 0)
            .endFill();
        this.addChild(rect)

        nodes.forEach(node => {
            node !== null ? this.debugQuadTree(node) : null;
        })
    }

    updateDots = (delta: number): void => {
        // stop the animation if runtime exceeds max runtime.
        this.runTime += delta;
        if (this.runTime >= this.maxRunTime) {
            this.currentState = WorldState.PAUSED;
            return;
        }

        // variable for holding possible collisions
        let possibleCollisions: Array<Dot> = new Array<Dot>();

        // clear quadtree
        this.quadTree.clear()

        // insert dots into quadtree and check random dots for wall collision. 
        for (let i = 0; i < this.dotsLeft.length; i++) {
            let dot: Dot = this.dotsLeft[i];
            this.quadTree.insert(dot);
            if (dot.isRandom) {
                this.checkWallCollisionLeftPatch(dot);
            }
        }

        // checks for dot collisions and updates velocity if collision is detected.
        for (let i = 0; i < this.dotsLeft.length; i++) {
            let dot: Dot = this.dotsLeft[i];
            possibleCollisions = [];
            possibleCollisions = this.quadTree.retrieve(possibleCollisions, dot);
            possibleCollisions.forEach(otherDot => {
                dot.collideWithDot(otherDot);
            });
        }

        // update dot timers and position, check if alive timer is exceeded.
        this.dotsLeft.forEach(dot => {
            dot.update(delta);
            if (dot.aliveTimer <= 0) {
                dot.resetAliveTimer();
                let dotPosition: [number, number] =
                    this.getFreeSpotInPatch(
                        this.leftMinX + this.dotRadius,
                        this.patchMinY + this.dotRadius,
                        this.leftMaxX - this.dotRadius,
                        this.patchMaxY - this.dotRadius,
                        this.dotsLeft
                    )
                dot.setPosition(dotPosition[0], dotPosition[1]);
            }
        });

        // clear quadtree
        this.quadTree.clear()

        // insert dots into quadtree and check random dots for wall collision. 
        for (let i = 0; i < this.dotsRight.length; i++) {
            let dot: Dot = this.dotsRight[i];
            this.quadTree.insert(dot);
            if (dot.isRandom) {
                this.checkWallCollisionRightPatch(dot);
            }
        }

        // checks for dot collisions and updates velocity if collision is detected.
        for (let i = 0; i < this.dotsRight.length; i++) {
            let dot: Dot = this.dotsRight[i];
            possibleCollisions = [];
            possibleCollisions = this.quadTree.retrieve(possibleCollisions, dot);
            possibleCollisions.forEach(otherDot => {
                dot.collideWithDot(otherDot);
            });
        }

        // update dot timers and position, check if alive timer is exceeded.
        this.dotsRight.forEach(dot => {
            dot.update(delta);
            if (dot.aliveTimer <= 0) {
                dot.resetAliveTimer();
                let dotPosition: [number, number] =
                    this.getFreeSpotInPatch(
                        this.rightMinX + this.dotRadius,
                        this.patchMinY + this.dotRadius,
                        this.rightMaxX - this.dotRadius,
                        this.patchMaxY - this.dotRadius,
                        this.dotsRight
                    )
                dot.setPosition(dotPosition[0], dotPosition[1]);
            }
        })
    }

    calculateMaxMin = (): void => {
        this.leftMinX = this.patchLeft.x + PATCH_OUTLINE_THICKNESS;
        this.leftMaxX = (this.leftMinX + this.patchLeft.width) - (3 * PATCH_OUTLINE_THICKNESS);

        this.patchMinY = this.patchLeft.y + PATCH_OUTLINE_THICKNESS;
        this.patchMaxY = (this.patchLeft.y + this.patchLeft.height) - PATCH_OUTLINE_THICKNESS;

        this.rightMinX = this.patchRight.x + PATCH_OUTLINE_THICKNESS;
        this.rightMaxX = (this.patchRight.x + this.patchRight.width) - (3 * PATCH_OUTLINE_THICKNESS);
    }

    createDotContainerMasks = () => {
        this.patchLeftMask = new PIXI.Graphics()
            .beginFill(0)
            .drawRect(
                this.leftMinX,
                this.patchMinY,
                this.leftMaxX - this.leftMinX,
                this.patchMaxY - this.patchMinY
            )
            .endFill();

        this.patchRightMask = new PIXI.Graphics()
            .beginFill(0)
            .drawRect(
                this.rightMinX,
                this.patchMinY,
                this.rightMaxX - this.rightMinX,
                this.patchMaxY - this.patchMinY
            )
            .endFill()

        this.dotsLeftContainer.mask = this.patchLeftMask;
        this.dotsRightContainer.mask = this.patchRightMask;
        this.addChild(this.dotsLeftContainer, this.dotsRightContainer);
    }

    /**
     * Checks if there already is a dot at location
     * @param x new dot's x position
     * @param y new dot's y position
     * @param dots the array containing dots to compare with
     * @return true if spot is free
     */
    freeSpot = (x: number, y: number, dots: Array<Dot>): boolean => {
        for (let i = 0; i < dots.length; i++) {
            if (euclideanDistance(x, y, dots[i].x, dots[i].y) <= (this.dotSpacing + 2 * this.dotRadius)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Finds a vacant spot within a patch to place a new dot.
     * @param minX min x of patch
     * @param minY min y of patch
     * @param maxX max x of patch
     * @param maxY max y of patch
     * @param dots dots in patch
     */
    getFreeSpotInPatch = (minX: number, minY: number, maxX: number, maxY: number, dots: Array<Dot>): [number, number] => {
        let x, y: number;
        do {
            x = rando() * (maxX - minX) + minX;
            y = rando() * (maxY - minY) + minY;
        } while (!this.freeSpot(x, y, dots))
        return [x, y]
    }

    /**
     * Checks if a dot in the left patch is colliding with a wall
     * @param dot to test for wall collision
     */
    checkWallCollisionLeftPatch = (dot: Dot): void => {
        if (dot.x - dot.radius <= this.leftMinX) {
            dot.collideWithWall(this.leftMinX, dot.y);
        } else if (dot.x + dot.radius >= this.leftMaxX) {
            dot.collideWithWall(this.leftMaxX, dot.y);
        } else if (dot.y - dot.radius <= this.patchMinY) {
            dot.collideWithWall(dot.x, this.patchMinY);
        } else if (dot.y + dot.radius >= this.patchMaxY) {
            dot.collideWithWall(dot.x, this.patchMaxY);
        }
    }

    /**
     * Checks if a dot in the right patch is colliding with a wall
     * @param dot to test for wall collision
     */
    checkWallCollisionRightPatch = (dot: Dot): void => {
        if (dot.x - dot.radius <= this.rightMinX) {
            dot.collideWithWall(this.rightMinX, dot.y);
        } else if (dot.x + dot.radius >= this.rightMaxX) {
            dot.collideWithWall(this.rightMaxX, dot.y);
        } else if (dot.y - dot.radius <= this.patchMinY) {
            dot.collideWithWall(dot.x, this.patchMinY);
        } else if (dot.y + dot.radius >= this.patchMaxY) {
            dot.collideWithWall(dot.x, this.patchMaxY);
        }
    }

    getCoherentPatchSide = (): string => {
        return this.coherentPatchSide;
    }

    getState = (): WorldState => {
        return this.currentState;
    }

    setState = (state: WorldState) => {
        this.currentState = state;
    }

    getCoherencePercent = (): number => {
        return this.coherencePercent;
    }
}
