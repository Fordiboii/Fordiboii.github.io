import * as PIXI from 'pixi.js';
import { GlowFilter } from 'pixi-filters';
import { GameApp } from '../../app';
import { MotionTutorialTrialWorld } from '../../motion/MotionTutorialTrialWorld';
import { FormTutorialTrialWorld } from '../../form/FormTutorialTrialWorld';
import { TextButton } from '../../objects/buttons/TextButton';
import {
    BLUE_TEXT_COLOR,
    GLOW_FILTER_DISTANCE,
    GLOW_FILTER_QUALITY,
    GREEN_TEXT_COLOR,
    KEY_LEFT,
    KEY_RIGHT,
    NEXT_BUTTON_COLOR,
    NEXT_BUTTON_HOVER_COLOR,
    NEXT_BUTTON_STROKE_COLOR,
    PATCH_LABEL_COLOR,
    RED_TEXT_COLOR,
    START_BUTTON_COLOR,
    START_BUTTON_HOVER_COLOR,
    START_BUTTON_STROKE_COLOR,
    TEXT_COLOR
} from '../../utils/Constants';
import { TestType, WorldState } from '../../utils/Enums';
import { Psychophysics } from '../../utils/Psychophysics';
import { Settings } from '../../utils/Settings';
import { TutorialScreen } from './TutorialScreen';
import i18next, { TFunction } from 'i18next';

export class TutorialTrialScreen extends TutorialScreen {
    public maxSteps: number;
    public stepCounter: number;
    private correctAnswerFactor: number;
    private wrongAnswerFactor: number;

    private tutorialTrialWorld: MotionTutorialTrialWorld | FormTutorialTrialWorld;
    private tutorialTrialWorldContainer: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);

    private startButton: TextButton;

    private trialTextContainer: PIXI.Container = new PIXI.Container();
    private trialTextBackgroundColor: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);

    private patchLeftLabel: PIXI.Text;
    private patchRightLabel: PIXI.Text;
    private trialCorrectText: PIXI.Text;
    private trialIncorrectText: PIXI.Text;
    private trialFinishedText: PIXI.Text;
    private pauseText: PIXI.Text;

    // any type because pixi-filters isn't working properly with typescript
    public glowFilter1: any;
    public glowFilter2: any;

    constructor(gameApp: GameApp, testType: TestType) {
        super(gameApp);

        // get language translator
        const t: TFunction = i18next.t.bind(i18next);

        this.maxSteps = Settings.TRIAL_MAX_STEPS;
        this.stepCounter = 0;
        this.correctAnswerFactor = Psychophysics.decibelToFactor(Settings.TUTORIAL_STAIRCASE_CORRECT_ANSWER_DB);
        this.wrongAnswerFactor = Psychophysics.decibelToFactor(Settings.TUTORIAL_STAIRCASE_WRONG_ANSWER_DB);

        // set header text
        this.header.text = t("tutorialHeader");

        // add tutorial world based on test type
        if (testType == TestType.MOTION) {
            this.tutorialTrialWorld = new MotionTutorialTrialWorld(this);
        } else if (testType == TestType.FORM_FIXED) {
            this.tutorialTrialWorld = new FormTutorialTrialWorld(this, true);
        } else if (testType == TestType.FORM_RANDOM) {
            this.tutorialTrialWorld = new FormTutorialTrialWorld(this, false);
        }

        // add motion tutorial world background
        this.tutorialTrialWorldContainer.tint = 0;
        this.tutorialTrialWorldContainer.anchor.set(0.5, 0)
        this.tutorialTrialWorldContainer.x = this.contentX;
        this.tutorialTrialWorldContainer.y = this.contentY + Settings.WINDOW_HEIGHT_PX / 32;
        this.tutorialTrialWorldContainer.width = Settings.WINDOW_WIDTH_PX;
        this.tutorialTrialWorldContainer.height = Settings.WINDOW_HEIGHT_PX / 2.2;
        this.addChild(this.tutorialTrialWorldContainer);

        // add tutorial trial world
        this.addChild(this.tutorialTrialWorld);

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
        this.tutorialTrialWorld.patchLeft.filters = [this.glowFilter1];
        this.tutorialTrialWorld.patchRight.filters = [this.glowFilter2];

        // add patch labels
        this.patchLeftLabel = new PIXI.Text(t("patchLabelOne"), {
            fontName: "Helvetica-Normal",
            fontSize: Settings.FONT_SIZE * 1.2,
            fill: PATCH_LABEL_COLOR
        });
        this.patchLeftLabel.anchor.set(0.5);
        this.patchLeftLabel.roundPixels = true;
        this.patchLeftLabel.x = this.tutorialTrialWorld.patchLeft.x + this.tutorialTrialWorld.patchLeft.width / 2;
        this.patchLeftLabel.y = this.tutorialTrialWorld.patchLeft.y - Settings.WINDOW_HEIGHT_PX / 16;
        this.addChild(this.patchLeftLabel);

        this.patchRightLabel = new PIXI.Text(t("patchLabelTwo"), {
            fontName: "Helvetica-Normal",
            fontSize: Settings.FONT_SIZE * 1.2,
            fill: PATCH_LABEL_COLOR
        });
        this.patchRightLabel.anchor.set(0.5);
        this.patchRightLabel.roundPixels = true;
        this.patchRightLabel.x = this.tutorialTrialWorld.patchRight.x + this.tutorialTrialWorld.patchRight.width / 2;
        this.patchRightLabel.y = this.tutorialTrialWorld.patchRight.y - Settings.WINDOW_HEIGHT_PX / 16;
        this.addChild(this.patchRightLabel);

        // add text shown when animation is paused
        this.pauseText = new PIXI.Text(t("pauseText"), {
            fontName: "Helvetica-Normal",
            fontSize: Settings.FONT_SIZE * 0.9,
            fill: PATCH_LABEL_COLOR
        });
        this.pauseText.anchor.set(0.5, 0);
        this.pauseText.roundPixels = true;
        this.pauseText.x = Settings.WINDOW_WIDTH_PX / 2;
        this.pauseText.y = Settings.TRIAL_SCREEN_Y + this.tutorialTrialWorld.patchLeft.height / 1.5;
        this.pauseText.visible = false;
        this.addChild(this.pauseText);

        // add start button
        this.startButton =
            new TextButton(
                Settings.WINDOW_WIDTH_PX / 2,
                Settings.TRIAL_SCREEN_Y,
                Settings.TEXT_BUTTON_WIDTH * 1.1,
                Settings.TEXT_BUTTON_HEIGHT,
                START_BUTTON_COLOR,
                START_BUTTON_STROKE_COLOR,
                t("tutorialTrialScreen.startTutorialTrialButton"),
                TEXT_COLOR,
                START_BUTTON_HOVER_COLOR,
                false,
                undefined,
                undefined,
                Settings.FONT_SIZE * 0.8
            );
        this.addChild(this.startButton);

        // add tutorial text
        this.tutorialText.text = t("tutorialTrialScreen.tutorialText");

        // add trial texts
        const TRIAL_TEXT_X: number = Settings.WINDOW_WIDTH_PX / 2;
        const TRIAL_TEXT_Y: number = Settings.TRIAL_SCREEN_Y + this.tutorialTrialWorld.patchLeft.height / 1.1;

        this.trialCorrectText = new PIXI.Text(t("tutorialTrialScreen.trialCorrect"),
            {
                fontName: 'Helvetica-Normal',
                fontSize: Settings.FONT_SIZE * 0.9,
                fill: GREEN_TEXT_COLOR,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: Settings.HEADER_WIDTH
            }
        );
        this.trialCorrectText.roundPixels = true;
        this.trialCorrectText.anchor.set(0.5, 1);
        this.trialCorrectText.x = TRIAL_TEXT_X;
        this.trialCorrectText.y = TRIAL_TEXT_Y;

        this.trialIncorrectText = new PIXI.Text(t("tutorialTrialScreen.trialIncorrect"),
            {
                fontName: 'Helvetica-Normal',
                fontSize: Settings.FONT_SIZE * 0.9,
                fill: RED_TEXT_COLOR,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: Settings.HEADER_WIDTH
            }
        );
        this.trialIncorrectText.roundPixels = true;
        this.trialIncorrectText.anchor.set(0.5, 1);
        this.trialIncorrectText.x = TRIAL_TEXT_X;
        this.trialIncorrectText.y = TRIAL_TEXT_Y;

        this.trialFinishedText = new PIXI.Text(t("tutorialTrialScreen.trialFinished"),
            {
                fontName: 'Helvetica-Normal',
                fontSize: Settings.FONT_SIZE * 0.9,
                fill: BLUE_TEXT_COLOR,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: Settings.HEADER_WIDTH
            }
        );
        this.trialFinishedText.roundPixels = true;
        this.trialFinishedText.anchor.set(0.5, 1);
        this.trialFinishedText.x = TRIAL_TEXT_X;
        this.trialFinishedText.y = TRIAL_TEXT_Y;

        this.trialCorrectText.visible = false;
        this.trialIncorrectText.visible = false;
        this.trialFinishedText.visible = false;

        this.trialTextBackgroundColor.anchor.set(0.5);
        this.trialTextBackgroundColor.tint = 0;
        this.trialTextContainer.visible = false;
        this.trialTextContainer.addChild(this.trialTextBackgroundColor, this.trialCorrectText, this.trialIncorrectText, this.trialFinishedText);
        this.addChild(this.trialTextContainer)

        // set selected circle
        const circleFilledTexture: PIXI.Texture = PIXI.Loader.shared.resources['circleFilled'].texture;
        this.circles[3].texture = circleFilledTexture;
    }

    update = (delta: number): void => {
        if (this.tutorialTrialWorld.getState() == WorldState.TRIAL_CORRECT) {
            this.trialCorrectText.visible = true;

            this.trialTextBackgroundColor.x = this.trialCorrectText.x;
            this.trialTextBackgroundColor.y = this.trialCorrectText.y;
            this.trialTextBackgroundColor.width = this.trialCorrectText.width;
            this.trialTextBackgroundColor.height = this.trialCorrectText.height * 1.5;
            this.trialTextContainer.visible = true;

            this.pauseText.visible = false;
        } else if (this.tutorialTrialWorld.getState() == WorldState.TRIAL_INCORRECT) {
            this.trialIncorrectText.visible = true;

            this.trialTextBackgroundColor.x = this.trialIncorrectText.x;
            this.trialTextBackgroundColor.y = this.trialIncorrectText.y;
            this.trialTextBackgroundColor.width = this.trialIncorrectText.width;
            this.trialTextBackgroundColor.height = this.trialIncorrectText.height * 1.5;
            this.trialTextContainer.visible = true;

            this.pauseText.visible = false;
        } else if (this.tutorialTrialWorld.getState() == WorldState.FINISHED) {
            this.trialCorrectText.visible = false;
            this.trialIncorrectText.visible = false;
            this.trialFinishedText.visible = true;

            this.trialTextBackgroundColor.x = this.trialFinishedText.x;
            this.trialTextBackgroundColor.y = this.trialFinishedText.y;
            this.trialTextBackgroundColor.width = this.trialFinishedText.width;
            this.trialTextBackgroundColor.height = this.trialFinishedText.height * 1.5;
            this.trialTextContainer.visible = true;

            this.pauseText.visible = false;
        } else if (this.tutorialTrialWorld.getState() == WorldState.PAUSED && !this.startButton.visible) {
            this.pauseText.visible = true;
        } else {
            this.trialCorrectText.visible = false;
            this.trialIncorrectText.visible = false;
            this.trialFinishedText.visible = false;
            this.trialTextContainer.visible = false;
        }
        this.tutorialTrialWorld.update(delta);
    }

    keyDownHandler = (event: KeyboardEvent): void => {
        if (event.repeat) return

        const currentState: WorldState = this.tutorialTrialWorld.getState();
        if (currentState == WorldState.RUNNING || currentState == WorldState.PAUSED) {

            let coherentPatchSide: string = this.tutorialTrialWorld.getCoherentPatchSide();

            if (event.code == KEY_LEFT) {
                // enable glow filter on the selected patch
                this.glowFilter1.enabled = true;

                // update coherency
                if (coherentPatchSide == "LEFT") {
                    this.tutorialTrialWorld.updateCoherency(this.correctAnswerFactor, true);
                    this.tutorialTrialWorld.setState(WorldState.TRIAL_CORRECT);
                } else {
                    this.tutorialTrialWorld.updateCoherency(this.wrongAnswerFactor, false);
                    this.tutorialTrialWorld.setState(WorldState.TRIAL_INCORRECT);
                }

                this.stepCounter++;
            } else if (event.code == KEY_RIGHT) {
                // enable glow filter on the selected patch
                this.glowFilter2.enabled = true;

                // update coherency and state
                if (coherentPatchSide == "RIGHT") {
                    this.tutorialTrialWorld.updateCoherency(this.correctAnswerFactor, true);
                    this.tutorialTrialWorld.setState(WorldState.TRIAL_CORRECT);
                } else {
                    this.tutorialTrialWorld.updateCoherency(this.wrongAnswerFactor, false);
                    this.tutorialTrialWorld.setState(WorldState.TRIAL_INCORRECT);
                }

                this.stepCounter++;
            }
        }
    }

    mouseDownHandler = (patch: string): void => {
        const currentState: WorldState = this.tutorialTrialWorld.getState();
        if (currentState == WorldState.RUNNING || currentState == WorldState.PAUSED) {
            let coherentPatchSide: string = this.tutorialTrialWorld.getCoherentPatchSide();

            // enable glow filter on the selected patch
            if (patch == "LEFT") {
                this.glowFilter1.enabled = true;
            } else {
                this.glowFilter2.enabled = true;
            }

            // update coherency and state
            if (patch == coherentPatchSide) {
                this.tutorialTrialWorld.updateCoherency(this.correctAnswerFactor, true);
                this.tutorialTrialWorld.setState(WorldState.TRIAL_CORRECT);
            } else {
                this.tutorialTrialWorld.updateCoherency(this.wrongAnswerFactor, false);
                this.tutorialTrialWorld.setState(WorldState.TRIAL_INCORRECT);
            }

            this.stepCounter++;
        }
    }

    startButtonClickHandler = (): void => {
        // add event handlers
        window.addEventListener("keydown", this.keyDownHandler);
        this.tutorialTrialWorld.patchLeft.on("mousedown", (): void => this.mouseDownHandler("LEFT"));
        this.tutorialTrialWorld.patchLeft.on("touchstart", (): void => this.mouseDownHandler("LEFT"));
        this.tutorialTrialWorld.patchRight.on("mousedown", (): void => this.mouseDownHandler("RIGHT"));
        this.tutorialTrialWorld.patchRight.on("touchstart", (): void => this.mouseDownHandler("RIGHT"));

        // hide start button, make patches interactive and set state to running
        this.startButton.visible = false;
        this.tutorialTrialWorld.patchLeft.interactive = true;
        this.tutorialTrialWorld.patchRight.interactive = true;
        this.tutorialTrialWorld.patchLeftObjectsContainer.visible = true;
        this.tutorialTrialWorld.patchRightObjectsContainer.visible = true;
        this.tutorialTrialWorld.setState(WorldState.RUNNING);
    }

    resizeEventHandler = (): void => {
        // add event handlers
        this.tutorialTrialWorld.patchLeft.on("mousedown", (): void => this.mouseDownHandler("LEFT"));
        this.tutorialTrialWorld.patchLeft.on("touchstart", (): void => this.mouseDownHandler("LEFT"));
        this.tutorialTrialWorld.patchRight.on("mousedown", (): void => this.mouseDownHandler("RIGHT"));
        this.tutorialTrialWorld.patchRight.on("touchstart", (): void => this.mouseDownHandler("RIGHT"));

        // make the new patches interactive
        this.tutorialTrialWorld.patchLeft.interactive = true;
        this.tutorialTrialWorld.patchRight.interactive = true;
    }

    backButtonClickHandler = (): void => {
        this.gameApp.changeScreen("tutorialTaskScreen");
    }

    nextButtonClickHandler = (): void => {
        this.gameApp.changeScreen("testScreen");
    }

    hideObjects = (): void => {
        this.tutorialTrialWorld.patchLeftObjectsContainer.visible = false;
        this.tutorialTrialWorld.patchRightObjectsContainer.visible = false;
    }

    touchEndHandler = (e: PIXI.InteractionEvent): void => {
        const finalPoint: PIXI.Point = e.data.getLocalPosition(this.parent);
        const xAbs: number = Math.abs(this.initialPoint.x - finalPoint.x);

        if (xAbs > this.changeScreenDragDistance) {
            if (finalPoint.x < this.initialPoint.x)
                this.gameApp.changeScreen("testScreen");
            else
                this.gameApp.changeScreen("tutorialTaskScreen");
        }

        if (this.tutorialTrialWorld.getState() != WorldState.PAUSED) {
            this.tutorialTrialWorld.patchLeftObjectsContainer.visible = true;
            this.tutorialTrialWorld.patchRightObjectsContainer.visible = true;
        }
    }

    /**
     * Adds all custom event listeners
     */
    addEventListeners = (): void => {
        this.on("touchmove", this.hideObjects);
        this.on("touchend", this.touchEndHandler);
        this.on("touchendoutside", this.touchEndHandler);
        this.startButton.on("click", this.startButtonClickHandler);
        this.startButton.on("touchend", this.startButtonClickHandler);
        this.backButton.on("click", this.backButtonClickHandler);
        this.backButton.on("touchend", this.backButtonClickHandler);
        this.nextButton.on("click", this.nextButtonClickHandler);
        this.nextButton.on("touchend", this.nextButtonClickHandler);
    }

    /**
     * Removes all custom event listeners
     */
    removeEventListeners = (): void => {
        this.tutorialTrialWorld.patchLeft.off("mousedown", (): void => this.mouseDownHandler("LEFT"));
        this.tutorialTrialWorld.patchLeft.off("touchstart", (): void => this.mouseDownHandler("LEFT"));
        this.tutorialTrialWorld.patchRight.off("mousedown", (): void => this.mouseDownHandler("RIGHT"));
        this.tutorialTrialWorld.patchRight.off("touchstart", (): void => this.mouseDownHandler("RIGHT"));

        this.startButton.off("click", this.startButtonClickHandler);
        this.startButton.off("touchend", this.startButtonClickHandler);
        this.backButton.off("click", this.backButtonClickHandler);
        this.backButton.off("touchend", this.backButtonClickHandler);
        this.nextButton.off("click", this.nextButtonClickHandler);
        this.nextButton.off("touchend", this.nextButtonClickHandler);

        this.off("touchmove", this.hideObjects);
        this.off("touchend", this.touchEndHandler);
        this.off("touchendoutside", this.touchEndHandler);
    }

    resize = (width: number, height: number) => {
        // get language translator
        const t: TFunction = i18next.t.bind(i18next);

        // button positions
        const backButtonX: number = width / 2 - Settings.NEXT_BACK_BUTTON_SPACING;
        const nextButtonX: number = width / 2 + Settings.NEXT_BACK_BUTTON_SPACING;
        const backAndNextButtonY: number = height - 1.3 * Settings.CIRCLE_BUTTON_TOP_BOTTOM_PADDING - Settings.TEXT_BUTTON_HEIGHT / 2;

        // background color
        this.backgroundColorSprite.width = width;
        this.backgroundColorSprite.height = height;

        // header
        const HEADER_FONT_SIZE: number = Settings.FONT_SIZE * 1.2;
        this.header.style.fontSize = HEADER_FONT_SIZE;
        this.header.style.wordWrapWidth = Settings.HEADER_WIDTH;
        this.header.x = width / 2;
        this.header.y = height / 16;

        // content and tutorial text positions
        this.contentX = width / 2;
        this.contentY = height / 12 + this.header.height;
        this.tutorialTextX = this.contentX;
        this.tutorialTextY = this.contentY + height / 2;

        // tutorial text
        this.tutorialText.style.fontSize = Settings.FONT_SIZE * 0.9;
        this.tutorialText.style.wordWrapWidth = Settings.TUTORIAL_TEXT_WIDTH;
        this.tutorialText.x = this.tutorialTextX;
        this.tutorialText.y = this.tutorialTextY;

        // destroy current and create new back button
        this.backButton.destroy();
        this.backButton =
            new TextButton(
                backButtonX,
                backAndNextButtonY,
                Settings.TEXT_BUTTON_WIDTH,
                Settings.TEXT_BUTTON_HEIGHT,
                NEXT_BUTTON_COLOR,
                NEXT_BUTTON_STROKE_COLOR,
                t("backButton"),
                TEXT_COLOR,
                NEXT_BUTTON_HOVER_COLOR
            );
        this.backButton.on("click", this.backButtonClickHandler);
        this.backButton.on("touchend", this.backButtonClickHandler);
        this.addChild(this.backButton);

        // destroy current and create new next button
        this.nextButton.destroy();
        this.nextButton =
            new TextButton(
                nextButtonX,
                backAndNextButtonY,
                Settings.TEXT_BUTTON_WIDTH,
                Settings.TEXT_BUTTON_HEIGHT,
                NEXT_BUTTON_COLOR,
                NEXT_BUTTON_STROKE_COLOR,
                t("nextButton"),
                TEXT_COLOR,
                NEXT_BUTTON_HOVER_COLOR
            );
        this.nextButton.on("click", this.nextButtonClickHandler);
        this.nextButton.on("touchend", this.nextButtonClickHandler);
        this.addChild(this.nextButton);

        // circles
        for (let i = 0; i < 4; i++) {
            this.circles[i].position.set(i * Settings.CIRCLE_BUTTON_WIDTH * 2, 0);
            this.circles[i].width = this.circles[i].height = Settings.CIRCLE_BUTTON_WIDTH;
        }
        this.circleContainer.x = width / 2 - this.circleContainer.getBounds().width / 2;
        this.circleContainer.y = height - Settings.CIRCLE_BUTTON_TOP_BOTTOM_PADDING / 1.5;

        // tutorial trial world container
        this.tutorialTrialWorldContainer.x = this.contentX;
        this.tutorialTrialWorldContainer.y = this.contentY + height / 32;
        this.tutorialTrialWorldContainer.width = width;
        this.tutorialTrialWorldContainer.height = height / 2.2;

        // tutorial trial world
        this.tutorialTrialWorld.resize();

        // destroy current and create new start button if not already clicked
        if (this.startButton.visible) {
            this.startButton.destroy();
            this.startButton =
                new TextButton(
                    width / 2,
                    Settings.TRIAL_SCREEN_Y,
                    Settings.TEXT_BUTTON_WIDTH * 1.1,
                    Settings.TEXT_BUTTON_HEIGHT,
                    START_BUTTON_COLOR,
                    START_BUTTON_STROKE_COLOR,
                    t("tutorialTrialScreen.startTutorialTrialButton"),
                    TEXT_COLOR,
                    START_BUTTON_HOVER_COLOR,
                    false,
                    undefined,
                    undefined,
                    Settings.FONT_SIZE * 0.8
                );
            this.startButton.on("click", this.startButtonClickHandler);
            this.startButton.on("touchend", this.startButtonClickHandler);
            this.addChild(this.startButton);
        } else {
            this.resizeEventHandler();
        }

        // patch label
        this.patchLeftLabel.x = this.tutorialTrialWorld.patchLeft.x + this.tutorialTrialWorld.patchLeft.width / 2;
        this.patchLeftLabel.y = this.tutorialTrialWorld.patchLeft.y - height / 16;
        this.patchRightLabel.x = this.tutorialTrialWorld.patchRight.x + this.tutorialTrialWorld.patchRight.width / 2;
        this.patchRightLabel.y = this.tutorialTrialWorld.patchRight.y - height / 16;
        this.patchLeftLabel.style.fontSize = this.patchRightLabel.style.fontSize = Settings.FONT_SIZE * 1.2;

        // pause text
        this.pauseText.style.fontSize = Settings.FONT_SIZE * 0.9;
        this.pauseText.x = width / 2;
        this.pauseText.y = Settings.TRIAL_SCREEN_Y + this.tutorialTrialWorld.patchLeft.height / 1.5;

        // trial correct, incorrect and finished texts
        const TRIAL_TEXT_X: number = width / 2;
        const TRIAL_TEXT_Y: number = Settings.TRIAL_SCREEN_Y + this.tutorialTrialWorld.patchLeft.height / 1.1;

        this.trialCorrectText.style.fontSize = Settings.FONT_SIZE * 0.9;
        this.trialCorrectText.style.wordWrapWidth = Settings.HEADER_WIDTH;
        this.trialCorrectText.x = TRIAL_TEXT_X;
        this.trialCorrectText.y = TRIAL_TEXT_Y;

        this.trialIncorrectText.style.fontSize = Settings.FONT_SIZE * 0.9;
        this.trialIncorrectText.style.wordWrapWidth = Settings.HEADER_WIDTH;
        this.trialIncorrectText.x = TRIAL_TEXT_X;
        this.trialIncorrectText.y = TRIAL_TEXT_Y;

        this.trialFinishedText.style.fontSize = Settings.FONT_SIZE * 0.9;
        this.trialFinishedText.style.wordWrapWidth = Settings.HEADER_WIDTH;
        this.trialFinishedText.x = TRIAL_TEXT_X;
        this.trialFinishedText.y = TRIAL_TEXT_Y;
    }

    languageChangeHandler = (): void => {
        const t: TFunction = i18next.t.bind(i18next);
        const testType: TestType = this.gameApp.testType;
        if (testType == TestType.MOTION) {
            this.tutorialText.text = t("tutorialTrialScreen.tutorialText");
        } else if (testType == TestType.FORM_FIXED) {
            this.tutorialText.text = t("tutorialTrialScreen.tutorialText");
        } else if (testType == TestType.FORM_RANDOM) {
            this.tutorialText.text = t("tutorialTrialScreen.tutorialText");
        }
        this.header.text = t("tutorialHeader");
        this.patchLeftLabel.text = t("patchLabelOne");
        this.patchRightLabel.text = t("patchLabelTwo");
        this.pauseText.text = t("pauseText");
        this.startButton.buttonText.text = t("tutorialTrialScreen.startTutorialTrialButton");
        this.trialCorrectText.text = t("tutorialTrialScreen.trialCorrect");
        this.trialIncorrectText.text = t("tutorialTrialScreen.trialIncorrect");
        this.trialFinishedText.text = t("tutorialTrialScreen.trialFinished");
        this.nextButton.buttonText.text = t("nextButton");
        this.backButton.buttonText.text = t("backButton");
    }
}