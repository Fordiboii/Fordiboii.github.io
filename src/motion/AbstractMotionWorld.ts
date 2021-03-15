import { Dot } from "../objects/Dot";
import { Patch } from "../objects/Patch";
import * as PIXI from "pixi.js";
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
    protected dotsToKill: number;
    protected dotSpawnSeparationDistance: number;

    protected numberOfDots: number;
    protected dotSpacing: number;
    protected dotRadius: number;
    protected dotMaxAliveTime: number;

    protected maxRunTime: number;
    protected runTime: number;

    protected correctAnswerFactor: number;
    protected wrongAnswerFactor: number;

    protected quadTree: QuadTree;

    protected leftGridPoints: Array<[number, number]>;
    protected rightGridPoints: Array<[number, number]>;

    constructor() {
        super();
        this.currentState = WorldState.PAUSED;

        this.runTime = 0;

        this.dotsLeft = new Array<Dot>();
        this.dotsRight = new Array<Dot>();

        this.coherencePercent = Settings.DOT_COHERENCE_PERCENTAGE;
        this.dotKillPercentage = Settings.DOT_KILL_PERCENTAGE;
        this.numberOfDots = Settings.DOT_TOTAL_AMOUNT;
        this.dotsToKill = (Settings.DOT_KILL_PERCENTAGE * Settings.DOT_TOTAL_AMOUNT) / 100;
        this.dotSpawnSeparationDistance = 2 * Settings.DOT_RADIUS + Settings.DOT_SPACING;

        this.dotRadius = Settings.DOT_RADIUS;
        this.dotSpacing = Settings.DOT_SPACING;
        this.maxRunTime = Settings.DOT_MAX_ANIMATION_TIME;
        this.dotMaxAliveTime = Settings.DOT_MAX_ALIVE_TIME;

        // use particle container for faster rendering. 
        this.dotsLeftContainer.addChild(this.dotsLeftParticleContainer);
        this.dotsRightContainer.addChild(this.dotsRightParticleContainer);

        // make dot containers hidden
        this.dotsLeftContainer.visible = false;
        this.dotsRightContainer.visible = false;
    }

    abstract update(delta: number): void;

    abstract createPatches(): void;

    abstract createDots(): void;

    abstract createNewTrial(): void;

    abstract updateCoherency(factor: number, isCorrectAnswer: boolean): void;

    destroyDots = (): void => {
        this.dotsLeft.forEach(dot => dot.destroy());
        this.dotsRight.forEach(dot => dot.destroy());
    }

    reset = (): void => {
        this.dotsLeftParticleContainer.visible = false;
        this.dotsRightParticleContainer.visible = false;
        this.runTime = 0;
        this.createNewTrial();
        this.dotsLeftParticleContainer.visible = true;
        this.dotsRightParticleContainer.visible = true;
    }

    paused = (): void => {
        if (this.runTime >= this.maxRunTime) {
            this.runTime = 0;
            this.dotsLeftParticleContainer.visible = false;
            this.dotsRightParticleContainer.visible = false;
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
        let possibleCollisions: Array<Dot> = new Array<Dot>();
        let dot: Dot;
        let dotPosition: [number, number];

        // stop the animation if runtime exceeds max runtime.
        this.runTime += delta;
        if (this.runTime >= this.maxRunTime) {
            this.currentState = WorldState.PAUSED;
            return;
        }

        // clear quadtree
        this.quadTree.clear()

        // insert dots into quadtree
        this.dotsLeft.forEach(dot => this.quadTree.insert(dot));

        // check for collisions and update velocity if collision detected
        for (let i = 0; i < this.dotsLeft.length; i++) {
            dot = this.dotsLeft[i];
            possibleCollisions = [];

            if (dot.isRandom) {
                this.checkWallCollisionLeftPatch(dot);
            }

            possibleCollisions = this.quadTree.retrieve(possibleCollisions, dot);
            possibleCollisions.forEach(otherDot => {
                dot.collideWithDot(otherDot);
            });
        }

        // update position and check if it's time to respawn
        this.dotsLeft.forEach(dot => {
            dot.update(delta);
            if (dot.aliveTimer <= 0) {
                dot.resetAliveTimer();
                dotPosition =
                    this.getRandomPosition(
                        this.leftMinX + this.dotRadius,
                        this.patchMinY + this.dotRadius,
                        this.leftMaxX - this.dotRadius,
                        this.patchMaxY - this.dotRadius
                    )
                dot.setPosition(dotPosition[0], dotPosition[1]);
            }
        });

        // clear quadtree
        this.quadTree.clear()

        // insert dots into quadtree
        this.dotsRight.forEach(dot => this.quadTree.insert(dot));

        // check for collisions and update velocity if collision detected
        for (let i = 0; i < this.dotsRight.length; i++) {
            dot = this.dotsRight[i];
            possibleCollisions = [];

            if (dot.isRandom) {
                this.checkWallCollisionRightPatch(dot);
            }

            possibleCollisions = this.quadTree.retrieve(possibleCollisions, dot);
            possibleCollisions.forEach(otherDot => {
                dot.collideWithDot(otherDot);
            });
        }

        // update position and check if it's time to respawn
        this.dotsRight.forEach(dot => {
            dot.update(delta);
            if (dot.aliveTimer <= 0) {
                dot.resetAliveTimer();
                dotPosition =
                    this.getRandomPosition(
                        this.rightMinX + this.dotRadius,
                        this.patchMinY + this.dotRadius,
                        this.rightMaxX - this.dotRadius,
                        this.patchMaxY - this.dotRadius
                    )
                dot.setPosition(dotPosition[0], dotPosition[1]);
            }
        })
    }

    calculateMaxMin = (): void => {
        this.leftMinX = this.patchLeft.x + PATCH_OUTLINE_THICKNESS;
        this.leftMaxX = (this.patchLeft.x + this.patchLeft.width) - (3 * PATCH_OUTLINE_THICKNESS);

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
     * Gets a random position within a rectangular area.
     * @param xMin left bound of area. Float.
     * @param yMin left bound of area. Float.
     * @param xMax left bound of area. Float.
     * @param yMax left bound of area. Float.
     * @returns array with x and y coordinates.
     */
    getRandomPosition = (xMin: number, yMin: number, xMax: number, yMax: number): [number, number] => {
        let x, y: number;
        x = rando() * (xMax - xMin) + xMin;
        y = rando() * (yMax - yMin) + yMin;
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
