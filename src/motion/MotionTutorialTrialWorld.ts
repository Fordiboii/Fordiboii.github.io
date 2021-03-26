import * as PIXI from 'pixi.js';
import { Direction, WorldState } from '../utils/Enums';
import { AbstractMotionWorld } from './AbstractMotionWorld';
import { rando, randoSequence } from '@nastyox/rando.js';
import { Dot } from '../objects/Dot';
import { QuadTree } from '../utils/QuadTree';
import { Psychophysics } from '../utils/Psychophysics';
import { Settings } from '../utils/Settings';
import { Patch } from '../objects/Patch';
import {
    DOT_SPAWN_SEPARATION_DISTANCE_MULTIPLIER,
    MAX_FEEDBACK_TIME,
    PATCH_OUTLINE_COLOR,
    PATCH_OUTLINE_THICKNESS
} from '../utils/Constants';
import { TutorialTrialScreen } from '../screens/TutorialTrialScreen';

export class MotionTutorialTrialWorld extends AbstractMotionWorld {
    private feedbackTimer: number = 0;
    private maxFeedbackTime: number = MAX_FEEDBACK_TIME;

    // reference to the screen object
    private tutorialTrialScreen: TutorialTrialScreen;

    constructor(tutorialTrialScreen: TutorialTrialScreen) {
        super();
        this.tutorialTrialScreen = tutorialTrialScreen;

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
                DOT_SPAWN_SEPARATION_DISTANCE_MULTIPLIER * this.dotSpawnSeparationDistance
            );
        this.rightGridPoints =
            this.createGridPoints(
                this.rightMinX + this.dotRadius,
                this.rightMaxX - this.dotRadius,
                this.patchMinY + this.dotRadius,
                this.patchMaxY - this.dotRadius,
                DOT_SPAWN_SEPARATION_DISTANCE_MULTIPLIER * this.dotSpawnSeparationDistance
            );

        this.createDots();
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
        } else if (this.currentState == WorldState.TRIAL_CORRECT) {
            this.feedback(delta);
        } else if (this.currentState == WorldState.TRIAL_INCORRECT) {
            this.feedback(delta);
        } else if (this.currentState == WorldState.FINISHED) {
            this.dotsLeftParticleContainer.visible = false;
            this.dotsRightParticleContainer.visible = false;
            this.patchLeft.interactive = false;
            this.patchRight.interactive = false;
            return;
        }
    }

    /**
     * Changes the state from TRIAL_CORRECT or TRIAL_INCORRECT to RUNNING if the max feedback time is reached and creates a new trial.
     * If the number of max steps is reached, it changes the state to FINISHED instead of RUNNING.
     * @param delta time between each frame in ms
     */
    feedback = (delta: number): void => {
        this.feedbackTimer += delta;
        this.dotsLeftParticleContainer.visible = false;
        this.dotsRightParticleContainer.visible = false;
        if (this.feedbackTimer >= this.maxFeedbackTime) {
            if (this.tutorialTrialScreen.stepCounter == this.tutorialTrialScreen.maxSteps) {
                this.setState(WorldState.FINISHED);
                this.feedbackTimer = 0;
                return;
            }
            this.feedbackTimer = 0;
            this.reset();
            this.setState(WorldState.RUNNING);
        }
    }

    reset = (): void => {
        this.dotsLeftParticleContainer.visible = false;
        this.dotsRightParticleContainer.visible = false;
        this.runTime = 0;
        this.createNewTrial();
        this.dotsLeftParticleContainer.visible = true;
        this.dotsRightParticleContainer.visible = true;
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
        let shuffledLeftGridPoints = randoSequence(this.leftGridPoints);
        let shuffledRightGridPoints = randoSequence(this.rightGridPoints);

        // randomly choose patch to contain coherent dots
        this.coherentPatchSide = rando(1) ? Direction[0] : Direction[1];
        // randomly choose direction of coherent moving dots
        const coherentDirection: Direction = rando(1) ? Direction.RIGHT : Direction.LEFT;

        for (let i = 0; i < this.numberOfDots; i++) {
            // multiplier to give dots different respawn rate
            if (i == this.dotsToKill * maxAliveTimeMultiplier) {
                maxAliveTimeMultiplier++;
            }
            // get current coherent dots percentage
            currentCoherencePercent = (numberOfCoherentDots / this.numberOfDots) * 100;

            // get initial position
            dotPosition = shuffledLeftGridPoints[i].value;

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
            dotPosition = shuffledRightGridPoints[i].value;

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
     * Updates patches and dots when the user has chosen a patch.
     * Chooses a new random and coherent patch. 
     * Randomly places dots and updates their direction, timers and velocity. 
     */
    createNewTrial = (): void => {
        let maxAliveTimeMultiplier: number = 1;
        let numberOfCoherentDots: number = 0;
        let currentCoherencePercent: number;
        let dotPosition: [number, number];
        let dot: Dot;

        // shuffle grid points. Used to get random dot positions.
        let shuffledLeftGridPoints = randoSequence(this.leftGridPoints);
        let shuffledRightGridPoints = randoSequence(this.rightGridPoints);

        // randomly choose patch to contain coherent dots
        this.coherentPatchSide = rando(1) ? Direction[0] : Direction[1];

        // randomly choose direction of coherent moving dots
        const coherentDirection: Direction = rando(1) ? Direction.RIGHT : Direction.LEFT;

        for (let i = 0; i < this.numberOfDots; i++) {
            // multiplier to give dots different respawn rate
            if (i == this.dotsToKill * maxAliveTimeMultiplier) {
                maxAliveTimeMultiplier++;
            }
            // get current coherent dots percentage
            currentCoherencePercent = (numberOfCoherentDots / this.numberOfDots) * 100;

            // get new position
            dotPosition = shuffledLeftGridPoints[i].value;

            // update dot position and reset direction, timers and velocity.
            dot = this.dotsLeft[i];
            if (this.coherentPatchSide == "LEFT" && currentCoherencePercent < this.coherencePercent) {
                dot.setPosition(dotPosition[0], dotPosition[1])
                dot.setDirection(coherentDirection);
                dot.setTimers(this.dotMaxAliveTime * maxAliveTimeMultiplier);
                dot.resetVelocity();
                numberOfCoherentDots++;
            } else {
                dot.setPosition(dotPosition[0], dotPosition[1])
                dot.setDirection(Direction.RANDOM);
                dot.setTimers(this.dotMaxAliveTime * maxAliveTimeMultiplier);
                dot.resetVelocity();
            }

            // get new position
            dotPosition = shuffledRightGridPoints[i].value;

            // update dot position and reset direction, timers and velocity.
            dot = this.dotsRight[i];
            if (this.coherentPatchSide == "RIGHT" && currentCoherencePercent < this.coherencePercent) {
                dot.setPosition(dotPosition[0], dotPosition[1])
                dot.setDirection(coherentDirection);
                dot.setTimers(this.dotMaxAliveTime * maxAliveTimeMultiplier);
                dot.resetVelocity();
                numberOfCoherentDots++;
            } else {
                dot.setPosition(dotPosition[0], dotPosition[1])
                dot.setDirection(Direction.RANDOM);
                dot.setTimers(this.dotMaxAliveTime * maxAliveTimeMultiplier);
                dot.resetVelocity();
            }
        }
    }

    /**
     * Updates the coherency percentage by a decibel factor.
     * Decreases coherency if answer is correct, increases otherwise.
     * @param factor decibel factor used to increase or decrease coherency level.
     * @param isCorrectAnswer if the user chose the patch with coherent dots.
     */
    updateCoherency = (factor: number, isCorrectAnswer: boolean): void => {
        let temp: number = this.coherencePercent * factor;

        if (isCorrectAnswer) {
            if (factor > 1) {
                temp -= this.coherencePercent;
                this.coherencePercent -= temp;
            } else {
                this.coherencePercent = temp;
            }
        } else {
            if (factor > 1) {
                this.coherencePercent = temp;
            } else {
                temp -= this.coherencePercent;
                this.coherencePercent -= temp;
            }
            if (this.coherencePercent > 100) {
                this.coherencePercent = 100;
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
}