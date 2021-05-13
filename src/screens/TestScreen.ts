import * as PIXI from 'pixi.js';
import { GlowFilter } from "pixi-filters";
import { MotionWorld } from "../motion/MotionWorld";
import { FormWorld } from "../form/FormWorld";
import { Psychophysics } from "../utils/Psychophysics";
import { Settings } from "../utils/Settings";
import {
    SPRITE_BUTTON_HOVER_COLOR,
    TEXT_COLOR,
    KEY_BACKSPACE,
    KEY_LEFT,
    KEY_RIGHT,
    START_BUTTON_COLOR,
    START_BUTTON_HOVER_COLOR,
    START_BUTTON_STROKE_COLOR,
    PATCH_LABEL_COLOR,
    GLOW_FILTER_DISTANCE,
    GLOW_FILTER_QUALITY,
} from "../utils/Constants";
import { TestType, WorldState } from "../utils/Enums";
import { TextButton } from "../objects/buttons/TextButton";
import { SpriteButton } from "../objects/buttons/SpriteButton";
import { GameApp } from '../app';
import { Trial } from '../interfaces/trial';
import { TestResults } from '../objects/TestResults';
import i18next, { TFunction } from 'i18next';

export class TestScreen extends PIXI.Container {
    private gameApp: GameApp;
    private testType: TestType;

    private world: MotionWorld | FormWorld;

    public reversalPoints: number;
    public maxSteps: number;

    private prevStep: boolean;

    public reversalCounter: number;
    public stepCounter: number;
    private correctAnswerCounter: number;
    private wrongAnswerCounter: number;

    private selectionTimer: number;
    private trials: Array<Trial> = new Array<Trial>();

    private reversalValues: Array<number>;

    private correctAnswerFactor: number;
    private wrongAnswerFactor: number;

    private patchLeftLabel: PIXI.Text;
    private patchRightLabel: PIXI.Text;
    private startButton: TextButton;
    private backButton: SpriteButton;
    private pauseText: PIXI.Text;

    // any type because pixi-filters isn't working properly with typescript
    public glowFilter1: any;
    public glowFilter2: any;

    constructor(gameApp: GameApp, testType: TestType) {
        super();
        // reference to game object
        this.gameApp = gameApp;

        // get language translator
        const t: TFunction = i18next.t.bind(i18next);

        this.testType = testType;

        this.reversalPoints = Settings.STAIRCASE_REVERSAL_POINTS;
        this.maxSteps = Settings.STAIRCASE_MAX_ATTEMPTS;

        this.selectionTimer = 0;

        this.reversalCounter = 0;
        this.stepCounter = 0;
        this.correctAnswerCounter = 0;
        this.wrongAnswerCounter = 0;

        this.reversalValues = new Array<number>();

        this.correctAnswerFactor = Psychophysics.decibelToFactor(Settings.STAIRCASE_CORRECT_ANSWER_DB);
        this.wrongAnswerFactor = Psychophysics.decibelToFactor(Settings.STAIRCASE_WRONG_ANSWER_DB);

        // create motion or form world and add to container
        if (this.testType == TestType.MOTION) {
            this.world = new MotionWorld(this);
        } else if (this.testType == TestType.FORM_FIXED) {
            this.world = new FormWorld(this, true);
        } else if (this.testType == TestType.FORM_RANDOM) {
            this.world = new FormWorld(this, false);
        }
        this.addChild(this.world);

        // create glow filters for animating patch click
        this.glowFilter1 = new GlowFilter({
            distance: GLOW_FILTER_DISTANCE,
            outerStrength: 0,
            quality: GLOW_FILTER_QUALITY
        });
        this.glowFilter2 = new GlowFilter({
            distance: GLOW_FILTER_DISTANCE,
            outerStrength: 0,
            quality: GLOW_FILTER_QUALITY
        });
        this.glowFilter1.enabled = false;
        this.glowFilter2.enabled = false;
        this.world.patchLeft.filters = [this.glowFilter1];
        this.world.patchRight.filters = [this.glowFilter2];

        // create patch labels and add to container
        this.patchLeftLabel = new PIXI.Text(t("patchLabelOne"), {
            fontName: "Helvetica-Normal",
            fontSize: Settings.FONT_SIZE * 1.3,
            fill: PATCH_LABEL_COLOR
        });
        this.patchLeftLabel.anchor.set(0.5);
        this.patchLeftLabel.roundPixels = true;
        this.patchLeftLabel.x = this.world.patchLeft.x + this.world.patchLeft.width / 2;
        this.patchLeftLabel.y = this.world.patchLeft.y - Settings.WINDOW_HEIGHT_PX / 16;
        this.addChild(this.patchLeftLabel);

        this.patchRightLabel = new PIXI.Text(t("patchLabelTwo"), {
            fontName: "Helvetica-Normal",
            fontSize: Settings.FONT_SIZE * 1.3,
            fill: PATCH_LABEL_COLOR
        });
        this.patchRightLabel.anchor.set(0.5);
        this.patchRightLabel.roundPixels = true;
        this.patchRightLabel.x = this.world.patchRight.x + this.world.patchRight.width / 2;
        this.patchRightLabel.y = this.world.patchRight.y - Settings.WINDOW_HEIGHT_PX / 16;
        this.addChild(this.patchRightLabel);

        // add text shown when animation is paused
        this.pauseText = new PIXI.Text(t("pauseText"), {
            fontName: "Helvetica-Normal",
            fontSize: Settings.FONT_SIZE,
            fill: PATCH_LABEL_COLOR
        });
        this.pauseText.anchor.set(0.5, 0);
        this.pauseText.roundPixels = true;
        this.pauseText.x = Settings.WINDOW_WIDTH_PX / 2;
        this.pauseText.y = Settings.WINDOW_HEIGHT_PX / 2 + this.world.patchLeft.height / 1.5;
        this.pauseText.visible = false;
        this.addChild(this.pauseText);

        // create start button and add to container
        this.startButton =
            new TextButton(
                Settings.WINDOW_WIDTH_PX / 2,
                Settings.WINDOW_HEIGHT_PX / 2,
                Settings.TEXT_BUTTON_WIDTH,
                Settings.TEXT_BUTTON_HEIGHT,
                START_BUTTON_COLOR,
                START_BUTTON_STROKE_COLOR,
                t("testScreen.startTestButton"),
                TEXT_COLOR,
                START_BUTTON_HOVER_COLOR
            );
        this.addChild(this.startButton);

        // create back button and add to container
        const backButtonTexture = PIXI.Loader.shared.resources['backArrow'].texture;
        this.backButton =
            new SpriteButton(
                Settings.WINDOW_WIDTH_PX / 32,
                Settings.WINDOW_HEIGHT_PX / 32,
                Settings.WINDOW_WIDTH_PX / 40,
                Settings.WINDOW_WIDTH_PX / 40,
                backButtonTexture,
                [0.5, 0],
                SPRITE_BUTTON_HOVER_COLOR
            );
        this.addChild(this.backButton);
    }

    update = (delta: number): void => {
        if (this.world.getState() == WorldState.FINISHED) {
            // hide pause text
            this.pauseText.visible = false;
            // create test results
            const testResults: TestResults = new TestResults(this.gameApp.testType, this.trials, this.reversalValues, this.correctAnswerCounter, this.wrongAnswerCounter);
            this.gameApp.setTestResults(testResults);
            // change screen
            this.gameApp.changeScreen("resultsScreen");
        } else if (this.world.getState() == WorldState.PAUSED) {
            // show pause text if start button isn't visible, meaning the test has started and is paused.
            if (!this.startButton.visible) {
                this.pauseText.visible = true;
                // hide objects if test type is FORM_FIXED or MOTION
                if (this.testType == TestType.FORM_FIXED || this.testType == TestType.MOTION) {
                    this.world.patchLeftObjectsContainer.visible = false;
                    this.world.patchRightObjectsContainer.visible = false;
                }
            }
            // update motion world
            this.world.update(delta);
        } else {
            // hide pause text
            this.pauseText.visible = false;
            // update motion world
            this.world.update(delta);
        }

        // update timer
        if (this.world.getState() == WorldState.RUNNING) {
            this.selectionTimer += delta;
        }
    }

    keyLeftRightDownHandler = (event: KeyboardEvent): void => {
        // To prevent handler from triggering multiple times if a key is held
        if (event.repeat) return

        let currentStep: boolean = true;
        let reversalValue: number = this.world.getCoherencePercent();
        let coherentPatchSide: string = this.world.getCoherentPatchSide();

        if (event.code == KEY_LEFT) {
            // get current state
            const currentState: WorldState = this.world.getState();
            // only register input if state is RUNNING or PAUSED
            if (currentState == WorldState.RUNNING || currentState == WorldState.PAUSED) {
                // set state to PATCH_SELECTED
                this.world.setState(WorldState.PATCH_SELECTED);
                // enable glow filter on the selected patch
                this.glowFilter1.enabled = true;

                // update coherency and counters
                if (coherentPatchSide == "LEFT") {
                    this.world.updateCoherency(this.correctAnswerFactor, true);
                    this.correctAnswerCounter++;
                    // add trial data to results
                    this.trials.push({
                        selectedPatch: "LEFT",
                        coherentPatch: "LEFT",
                        timeToSelect: this.selectionTimer,
                        keypress: "keyLeft",
                        clickPosition: undefined,
                        currentCoherency: reversalValue
                    });
                } else {
                    this.world.updateCoherency(this.wrongAnswerFactor, false);
                    this.wrongAnswerCounter++;
                    currentStep = false;
                    // add trial data to results
                    this.trials.push({
                        selectedPatch: "LEFT",
                        coherentPatch: "RIGHT",
                        timeToSelect: this.selectionTimer,
                        keypress: "keyLeft",
                        clickPosition: undefined,
                        currentCoherency: reversalValue
                    });
                }

                // check if the current answer differs from the previous step. Save the value at reversal and increment counter
                if (this.stepCounter > 1 && this.prevStep != currentStep) {
                    this.reversalValues.push(reversalValue);
                    this.reversalCounter++;
                }

                this.prevStep = currentStep;
                this.stepCounter++;
                this.selectionTimer = 0;
            }
        } else if (event.code == KEY_RIGHT) {
            // get current state
            const currentState: WorldState = this.world.getState();
            // only register input if state is RUNNING or PAUSED
            if (currentState == WorldState.RUNNING || currentState == WorldState.PAUSED) {
                // set state to PATCH_SELECTED
                this.world.setState(WorldState.PATCH_SELECTED);
                // enable glow filter on the selected patch
                this.glowFilter2.enabled = true;

                // update coherency and counters
                if (coherentPatchSide == "RIGHT") {
                    this.world.updateCoherency(this.correctAnswerFactor, true);
                    this.correctAnswerCounter++;
                    // add trial data to results
                    this.trials.push({
                        selectedPatch: "RIGHT",
                        coherentPatch: "RIGHT",
                        timeToSelect: this.selectionTimer,
                        keypress: "keyRight",
                        clickPosition: undefined,
                        currentCoherency: reversalValue
                    });
                } else {
                    this.world.updateCoherency(this.wrongAnswerFactor, false);
                    this.wrongAnswerCounter++;
                    currentStep = false;
                    // add trial data to results
                    this.trials.push({
                        selectedPatch: "RIGHT",
                        coherentPatch: "LEFT",
                        timeToSelect: this.selectionTimer,
                        keypress: "keyRight",
                        clickPosition: undefined,
                        currentCoherency: reversalValue
                    });
                }

                // check if the current answer differs from the previous step. Save the value at reversal and increment counter
                if (this.stepCounter > 1 && this.prevStep != currentStep) {
                    this.reversalValues.push(reversalValue);
                    this.reversalCounter++;
                }

                this.prevStep = currentStep;
                this.stepCounter++;
                this.selectionTimer = 0;
            }
        }
    }

    keyBackspaceDownHandler = (event: KeyboardEvent): void => {
        if (event.repeat) return
        if (event.code == KEY_BACKSPACE) {
            this.gameApp.changeScreen("tutorialTrialScreen");
        }
    }

    mouseDownHandler = (patch: string, e: PIXI.InteractionEvent): void => {
        // get current state
        const currentState: WorldState = this.world.getState();
        // only register input if state is RUNNING or PAUSED
        if (currentState == WorldState.RUNNING || currentState == WorldState.PAUSED) {
            let currentStep: boolean = true;
            let reversalValue: number = this.world.getCoherencePercent();
            let coherentPatchSide: string = this.world.getCoherentPatchSide();

            // set state to PATCH_SELECTED
            this.world.setState(WorldState.PATCH_SELECTED);
            // enable glow filter on the selected patch
            if (patch == "LEFT") {
                this.glowFilter1.enabled = true;
            } else {
                this.glowFilter2.enabled = true;
            }

            // update coherency and counters
            if (patch == coherentPatchSide) {
                this.world.updateCoherency(this.correctAnswerFactor, true);
                this.correctAnswerCounter++;

                // add trial data to results
                if (patch == "LEFT") {
                    this.trials.push({
                        selectedPatch: "LEFT",
                        coherentPatch: "LEFT",
                        timeToSelect: this.selectionTimer,
                        keypress: undefined,
                        clickPosition: [e.data.global.x, e.data.global.y],
                        currentCoherency: reversalValue
                    });
                } else {
                    this.trials.push({
                        selectedPatch: "RIGHT",
                        coherentPatch: "RIGHT",
                        timeToSelect: this.selectionTimer,
                        keypress: undefined,
                        clickPosition: [e.data.global.x, e.data.global.y],
                        currentCoherency: reversalValue
                    });
                }
            } else {
                this.world.updateCoherency(this.wrongAnswerFactor, false);
                this.wrongAnswerCounter++;
                currentStep = false;

                // add trial data to results
                if (patch == "LEFT") {
                    this.trials.push({
                        selectedPatch: "LEFT",
                        coherentPatch: "RIGHT",
                        timeToSelect: this.selectionTimer,
                        keypress: undefined,
                        clickPosition: [e.data.global.x, e.data.global.y],
                        currentCoherency: reversalValue
                    });
                } else {
                    this.trials.push({
                        selectedPatch: "RIGHT",
                        coherentPatch: "LEFT",
                        timeToSelect: this.selectionTimer,
                        keypress: undefined,
                        clickPosition: [e.data.global.x, e.data.global.y],
                        currentCoherency: reversalValue
                    });
                }
            }

            // check if the current answer differs from the previous step. Save the value at reversal and increment counter
            if (this.stepCounter > 1 && this.prevStep != currentStep) {
                this.reversalValues.push(reversalValue);
                this.reversalCounter++;
            }

            this.prevStep = currentStep;
            this.stepCounter++;
            this.selectionTimer = 0;
        }
    }

    resetMotionWorld = (): void => {
        this.world = new MotionWorld(this);
    }

    startButtonClickHandler = (): void => {
        // add event handlers
        window.addEventListener("keydown", this.keyLeftRightDownHandler, true);
        this.world.patchLeft.on("mousedown", (e: PIXI.InteractionEvent): void => this.mouseDownHandler("LEFT", e));
        this.world.patchLeft.on("touchstart", (e: PIXI.InteractionEvent): void => this.mouseDownHandler("LEFT", e));
        this.world.patchRight.on("mousedown", (e: PIXI.InteractionEvent): void => this.mouseDownHandler("RIGHT", e));
        this.world.patchRight.on("touchstart", (e: PIXI.InteractionEvent): void => this.mouseDownHandler("RIGHT", e));

        // hide start button, make patches interactive and set state to running
        this.startButton.visible = false;
        this.world.patchLeft.interactive = true;
        this.world.patchRight.interactive = true;
        this.world.patchLeftObjectsContainer.visible = true;
        this.world.patchRightObjectsContainer.visible = true;
        this.world.setState(WorldState.RUNNING);
    }

    resizeEventHandler = (): void => {
        this.world.patchLeft.on("mousedown", (e: PIXI.InteractionEvent): void => this.mouseDownHandler("LEFT", e));
        this.world.patchLeft.on("touchstart", (e: PIXI.InteractionEvent): void => this.mouseDownHandler("LEFT", e));
        this.world.patchRight.on("mousedown", (e: PIXI.InteractionEvent): void => this.mouseDownHandler("RIGHT", e));
        this.world.patchRight.on("touchstart", (e: PIXI.InteractionEvent): void => this.mouseDownHandler("RIGHT", e));
        this.world.patchLeft.interactive = true;
        this.world.patchRight.interactive = true;
    }

    backButtonClickHandler = (): void => {
        this.gameApp.changeScreen("tutorialTrialScreen");
    }

    backButtonTouchendHandler = (): void => {
        this.gameApp.changeScreen("tutorialTrialScreen");
    }

    /**
     * Adds all custom event listeners.
     */
    addEventListeners = (): void => {
        window.addEventListener("keydown", this.keyBackspaceDownHandler, true);
        this.startButton.on("click", this.startButtonClickHandler);
        this.startButton.on("touchend", this.startButtonClickHandler);
        this.backButton.on("click", this.backButtonClickHandler);
        this.backButton.on("touchend", this.backButtonTouchendHandler);
    }

    /**
     * Removes all custom event listeners.
     */
    removeEventListeners = (): void => {
        window.removeEventListener("keydown", this.keyBackspaceDownHandler, true);
        window.removeEventListener("keydown", this.keyLeftRightDownHandler, true);
        this.backButton.removeAllListeners();
        this.startButton.removeAllListeners();
        this.world.patchLeft.removeAllListeners();
        this.world.patchRight.removeAllListeners();
    }

    resize = (width: number, height: number) => {
        // get language translator
        const t: TFunction = i18next.t.bind(i18next);

        // world
        this.world.resize();

        // back button
        this.backButton.x = width / 32;
        this.backButton.y = height / 32;
        this.backButton.width = width / 40;
        this.backButton.height = width / 40;

        // destroy current and create new start button if not already clicked
        if (this.startButton.visible) {
            this.startButton.destroy();
            this.startButton =
                new TextButton(
                    width / 2,
                    height / 2,
                    Settings.TEXT_BUTTON_WIDTH,
                    Settings.TEXT_BUTTON_HEIGHT,
                    START_BUTTON_COLOR,
                    START_BUTTON_STROKE_COLOR,
                    t("testScreen.startTestButton"),
                    TEXT_COLOR,
                    START_BUTTON_HOVER_COLOR
                );
            this.startButton.on("click", this.startButtonClickHandler);
            this.startButton.on("touchend", this.startButtonClickHandler);
            this.addChild(this.startButton);
        } else {
            // re-add patch event handlers and make them interactive
            this.resizeEventHandler();
        }

        // patch label
        this.patchLeftLabel.x = this.world.patchLeft.x + this.world.patchLeft.width / 2;
        this.patchLeftLabel.y = this.world.patchLeft.y - height / 16;
        this.patchRightLabel.x = this.world.patchRight.x + this.world.patchRight.width / 2;
        this.patchRightLabel.y = this.world.patchRight.y - height / 16;
        this.patchLeftLabel.style.fontSize = this.patchRightLabel.style.fontSize = Settings.FONT_SIZE * 1.2;

        // pause text
        this.pauseText.style.fontSize = Settings.FONT_SIZE * 0.9;
        this.pauseText.x = width / 2;
        this.pauseText.y = height / 2 + this.world.patchLeft.height / 1.5;
    }

    languageChangeHandler = (): void => {
        const t: TFunction = i18next.t.bind(i18next);
        this.patchLeftLabel.text = t("patchLabelOne");
        this.patchRightLabel.text = t("patchLabelTwo");
        this.startButton.buttonText.text = t("testScreen.startTestButton");
        this.pauseText.text = t("pauseText");
    }
}