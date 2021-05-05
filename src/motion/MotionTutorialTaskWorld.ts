import * as PIXI from 'pixi.js';
import { Direction, WorldState } from '../utils/Enums';
import { AbstractMotionWorld } from './AbstractMotionWorld';
import { Dot } from '../objects/Dot';
import { QuadTree } from '../utils/QuadTree';
import { Psychophysics } from '../utils/Psychophysics';
import { Settings } from '../utils/Settings';
import { Patch } from '../objects/Patch';
import {
    PATCH_OUTLINE_COLOR,
    PATCH_OUTLINE_THICKNESS
} from '../utils/Constants';
import { getRandomPosition } from '../utils/RandomPosition';

export class MotionTutorialTaskWorld extends AbstractMotionWorld {
    constructor() {
        super();
        this.createPatches();

        this.quadTree = this.createQuadTree(this.patchLeft.x, this.patchLeft.y, this.patchLeft.width * 2 + this.patchGap, this.patchLeft.height);

        this.calculateMaxMin();
        this.createDotContainerMasks();

        this.leftGridPoints =
            this.createGridPoints(
                this.leftMinX + this.dotRadius,
                this.leftMaxX - this.dotRadius,
                this.patchMinY + this.dotRadius,
                this.patchMaxY - this.dotRadius,
                this.dotSpawnSeparationDistance
            );
        this.rightGridPoints =
            this.createGridPoints(
                this.rightMinX + this.dotRadius,
                this.rightMaxX - this.dotRadius,
                this.patchMinY + this.dotRadius,
                this.patchMaxY - this.dotRadius,
                this.dotSpawnSeparationDistance
            );

        this.createDots();

        // show dots
        this.patchLeftObjectsContainer.visible = true;
        this.patchRightObjectsContainer.visible = true;

        // set state to running
        this.setState(WorldState.RUNNING);
    }

    /**
     * Updates dots.
     * @param delta time between each frame in ms
     */
    update = (delta: number): void => {
        if (this.currentState == WorldState.RUNNING) {
            this.updateDots(delta);
        } else if (this.currentState == WorldState.PAUSED) {
            this.paused();
        } else if (this.currentState == WorldState.FINISHED) {
            return;
        }
    }

    /**
     * Creates a new quadtree from the given rectangle bounds.
     * @param x rectangle left bound
     * @param y rectangle top bound
     * @param width rectangle right bound
     * @param height rectangle bottom bound
     * @returns a new instance of QuadTree
     */
    createQuadTree = (x: number, y: number, width: number, height: number): QuadTree => {
        return new QuadTree(0, new PIXI.Rectangle(x, y, width, height));
    }

    /**
     * Creates the left and right patches for placing dots
     */
    createPatches = (): void => {
        this.patchGap = Psychophysics.getPatchGapInPixels() / 1.4;
        const patchWidth: number = Psychophysics.getPatchWidthInPixels() / 1.4;
        const patchHeight: number = Psychophysics.getPatchHeightInPixels() / 1.4;

        const screenXCenter: number = Settings.TRIAL_SCREEN_X;
        const screenYCenter: number = Settings.TRIAL_SCREEN_Y;

        const patchLeftX: number = screenXCenter - patchWidth - (this.patchGap / 2);
        const patchRightX: number = screenXCenter + (this.patchGap / 2);
        const patchY: number = screenYCenter - (patchHeight / 2);

        // create patches
        this.patchLeft = new Patch(patchLeftX, patchY, patchWidth, patchHeight, PATCH_OUTLINE_THICKNESS, PATCH_OUTLINE_COLOR);
        this.patchRight = new Patch(patchRightX, patchY, patchWidth, patchHeight, PATCH_OUTLINE_THICKNESS, PATCH_OUTLINE_COLOR);

        // add patches to container
        this.addChild(this.patchLeft, this.patchRight);
    }

    /**
     * Fills the left and right patches with dots at random locations.
     * One of the patches will be set to have coherently moving dots moving left and right.
     */
    createDots = (): void => {
        let maxAliveTimeMultiplier: number = 1;
        let numberOfCoherentDots: number = 0;
        let currentCoherencePercent: number;
        let dotPosition: [number, number];
        let dotTexture: PIXI.Texture = PIXI.Loader.shared.resources['dot'].texture;
        let dot: Dot;

        // shuffle grid points. Used to get initial dot positions.
        this.shuffleGridPoints(this.leftGridPoints);
        this.shuffleGridPoints(this.rightGridPoints);

        // set coherent patch side to right
        this.coherentPatchSide = Direction[1];
        // randomly choose direction of coherent moving dots
        const coherentDirection: Direction = Math.round(Math.random()) ? Direction.RIGHT : Direction.LEFT;

        for (let i = 0; i < this.numberOfDots; i++) {
            // multiplier to give dots different respawn rate
            if (i == this.dotsToKill * maxAliveTimeMultiplier) {
                maxAliveTimeMultiplier++;
            }
            // get current coherent dots percentage
            currentCoherencePercent = (numberOfCoherentDots / this.numberOfDots) * 100;

            // get initial position
            dotPosition = this.leftGridPoints[i];

            // add dot to left patch
            if (this.coherentPatchSide == "LEFT" && currentCoherencePercent < this.coherencePercent) {
                dot = new Dot(dotPosition[0], dotPosition[1], this.dotRadius, coherentDirection, this.dotMaxAliveTime * maxAliveTimeMultiplier, dotTexture);
                // add to model
                this.dotsLeft.push(dot);
                // add to particle container
                this.dotsLeftParticleContainer.addChild(dot);
                numberOfCoherentDots++;
            } else {
                dot = new Dot(dotPosition[0], dotPosition[1], this.dotRadius, Direction.RANDOM, this.dotMaxAliveTime * maxAliveTimeMultiplier, dotTexture);
                // add to model
                this.dotsLeft.push(dot);
                // add to particle container
                this.dotsLeftParticleContainer.addChild(dot);
            }

            // get initial position
            dotPosition = this.rightGridPoints[i];

            // add dot to right patch
            if (this.coherentPatchSide == "RIGHT" && currentCoherencePercent < this.coherencePercent) {
                dot = new Dot(dotPosition[0], dotPosition[1], this.dotRadius, coherentDirection, this.dotMaxAliveTime * maxAliveTimeMultiplier, dotTexture);
                // add to model
                this.dotsRight.push(dot);
                // add to particle container
                this.dotsRightParticleContainer.addChild(dot);
                numberOfCoherentDots++;
            } else {
                dot = new Dot(dotPosition[0], dotPosition[1], this.dotRadius, Direction.RANDOM, this.dotMaxAliveTime * maxAliveTimeMultiplier, dotTexture);
                // add to model
                this.dotsRight.push(dot);
                // add to particle container
                this.dotsRightParticleContainer.addChild(dot);
            }
        }
    }

    /**
     * Creates a grid within a rectangle area with equally spaced grid lines.
     * Grid lines on both axes are sine waves. Sine waves are used to make the points appear more random.
     * Returns the points found on intersecting grid lines.
     * @param xMin left bound of area.
     * @param xMax right bound of area.
     * @param yMin top bound of area.
     * @param yMax bottom bound of area.
     * @param spacing distance between each grid line.
     * @returns an array of points where grid lines intersect
     */
    createGridPoints = (xMin: number, xMax: number, yMin: number, yMax: number, spacing: number): Array<[number, number]> => {
        let gridPoints: Array<[number, number]> = [];
        let x, y: number;

        const width: number = Math.floor(xMax - xMin);
        const height: number = Math.floor(yMax - yMin);

        const xOffset: number = width % spacing;
        const yOffset: number = height % spacing;

        const xLines: number = Math.floor((width - xOffset) / spacing);
        const yLines: number = Math.floor((height - yOffset) / spacing);

        if (xLines * yLines < this.numberOfDots) {
            throw new Error(
                "Cannot spawn dots with the current settings.\n" +
                "Either there are too many dots, too much dot spacing or too small patches.\n" +
                "Try adjusting the total number of dots or the dot spacing."
            );
        }

        const startX: number = xMin + (xOffset / 2);
        const startY: number = yMin + (yOffset / 2);

        for (let i = 0; i < xLines; i++) {
            for (let j = 0; j < yLines; j++) {
                x = startX + Math.sin(j) + i * spacing;
                y = startY + Math.sin(i) + j * spacing;
                if (x <= (xMax - (xOffset / 2)) &&
                    x >= (xMin + (xOffset / 2)) &&
                    y <= (yMax - (yOffset / 2)) &&
                    y >= (yMin + (yOffset / 2))
                ) {
                    gridPoints.push([x, y])
                }
            }
        }
        return gridPoints
    }

    /**
     * Override updateDots to keep showing the dots.
     */
    updateDots = (delta: number): void => {
        let possibleCollisions: Array<Dot> = new Array<Dot>();
        let dot: Dot;
        let dotPosition: [number, number];

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
                    getRandomPosition(
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
                    getRandomPosition(
                        this.rightMinX + this.dotRadius,
                        this.patchMinY + this.dotRadius,
                        this.rightMaxX - this.dotRadius,
                        this.patchMaxY - this.dotRadius
                    )
                dot.setPosition(dotPosition[0], dotPosition[1]);
            }
        })
    }

    resize = () => {
        // get old max values
        const currentLeftMaxX: number = this.leftMaxX.valueOf();
        const currentPatchMaxY: number = this.patchMaxY.valueOf();
        const currentRightMaxX: number = this.rightMaxX.valueOf();

        // remove old patches
        this.patchLeft.destroy();
        this.patchRight.destroy();

        // create new patches, quadtree and bounds
        this.createPatches();
        this.quadTree = this.createQuadTree(this.patchLeft.x, this.patchLeft.y, this.patchLeft.width * 2 + this.patchGap, this.patchLeft.height);
        this.calculateMaxMin();
        this.createDotContainerMasks();

        // update dot positions and insert into quadtree
        this.dotsLeft.forEach(dot => {
            dot.x += this.leftMaxX - currentLeftMaxX;
            dot.y += this.patchMaxY - currentPatchMaxY;
            this.quadTree.insert(dot);
        });

        this.dotsRight.forEach(dot => {
            dot.x += this.rightMaxX - currentRightMaxX;
            dot.y += this.patchMaxY - currentPatchMaxY;
            this.quadTree.insert(dot);
        });
    }
}