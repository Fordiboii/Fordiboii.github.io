import * as PIXI from 'pixi.js';
import { GameApp } from '../../app';
import { MotionTutorialTaskWorld } from '../../motion/MotionTutorialTaskWorld';
import { FormTutorialTaskWorld } from '../../form/FormTutorialTaskWorld';
import {
    GREEN_TEXT_COLOR,
    NEXT_BUTTON_COLOR,
    NEXT_BUTTON_HOVER_COLOR,
    NEXT_BUTTON_STROKE_COLOR,
    PATCH_LABEL_COLOR,
    RED_TEXT_COLOR,
    TEXT_COLOR
} from '../../utils/Constants';
import { Settings } from '../../utils/Settings';
import { TutorialScreen } from './TutorialScreen';
import { TestType } from '../../utils/Enums';
import { TextButton } from '../../objects/buttons/TextButton';
import i18next, { TFunction } from 'i18next';

export class TutorialTaskScreen extends TutorialScreen {
    private tutorialTaskWorld: MotionTutorialTaskWorld | FormTutorialTaskWorld;
    private tutorialWorldContainer: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    private greenCheckmark: PIXI.Sprite;
    private redCross: PIXI.Sprite;
    private patchLeftLabel: PIXI.Text;
    private patchRightLabel: PIXI.Text;

    constructor(gameApp: GameApp, testType: TestType) {
        super(gameApp);

        // get language translator
        const t: TFunction = i18next.t.bind(i18next);

        // set header
        this.header.text = t("tutorialHeader");

        // set tutorial world based on test type
        if (testType == TestType.MOTION) {
            this.tutorialTaskWorld = new MotionTutorialTaskWorld();
        } else if (testType == TestType.FORM_FIXED) {
            this.tutorialTaskWorld = new FormTutorialTaskWorld(true);
        } else if (testType == TestType.FORM_RANDOM) {
            this.tutorialTaskWorld = new FormTutorialTaskWorld(false);
        }

        // add motion tutorial world container
        this.tutorialWorldContainer.tint = 0;
        this.tutorialWorldContainer.anchor.set(0.5, 0)
        this.tutorialWorldContainer.x = this.contentX;
        this.tutorialWorldContainer.y = this.contentY + Settings.WINDOW_HEIGHT_PX / 32;
        this.tutorialWorldContainer.width = Settings.WINDOW_WIDTH_PX;
        this.tutorialWorldContainer.height = Settings.WINDOW_HEIGHT_PX / 2.2;
        this.addChild(this.tutorialWorldContainer);

        // add motion tutorial world
        this.addChild(this.tutorialTaskWorld);

        // add patch labels
        this.patchLeftLabel = new PIXI.Text(t("patchLabelOne"), {
            fontName: "Helvetica-Normal",
            fontSize: Settings.FONT_SIZE * 1.2,
            fill: PATCH_LABEL_COLOR
        });
        this.patchLeftLabel.anchor.set(0.5);
        this.patchLeftLabel.roundPixels = true;
        this.patchLeftLabel.x = this.tutorialTaskWorld.patchLeft.x + this.tutorialTaskWorld.patchLeft.width / 2;
        this.patchLeftLabel.y = this.tutorialTaskWorld.patchLeft.y - Settings.WINDOW_HEIGHT_PX / 16;
        this.addChild(this.patchLeftLabel);

        this.patchRightLabel = new PIXI.Text(t("patchLabelTwo"), {
            fontName: "Helvetica-Normal",
            fontSize: Settings.FONT_SIZE * 1.2,
            fill: PATCH_LABEL_COLOR
        });
        this.patchRightLabel.anchor.set(0.5);
        this.patchRightLabel.roundPixels = true;
        this.patchRightLabel.x = this.tutorialTaskWorld.patchRight.x + this.tutorialTaskWorld.patchRight.width / 2;
        this.patchRightLabel.y = this.tutorialTaskWorld.patchRight.y - Settings.WINDOW_HEIGHT_PX / 16;
        this.addChild(this.patchRightLabel);

        // add checkmark
        const greenCheckmarkTexture: PIXI.Texture = PIXI.Loader.shared.resources['checkmark'].texture;
        this.greenCheckmark = new PIXI.Sprite(greenCheckmarkTexture);
        this.greenCheckmark.anchor.set(0.5, 1);
        this.greenCheckmark.width = this.greenCheckmark.height = Settings.WINDOW_WIDTH_PX > Settings.WINDOW_HEIGHT_PX ? Settings.WINDOW_WIDTH_PX / 34 : Settings.WINDOW_HEIGHT_PX / 26;
        this.greenCheckmark.roundPixels = true;
        this.greenCheckmark.x = this.tutorialTaskWorld.patchRight.x + this.tutorialTaskWorld.patchRight.width / 2;
        this.greenCheckmark.y = Settings.TRIAL_SCREEN_Y + this.tutorialTaskWorld.patchLeft.height / 1.1;
        this.greenCheckmark.tint = GREEN_TEXT_COLOR;
        this.addChild(this.greenCheckmark);

        // add cross
        const redCrossTexture: PIXI.Texture = PIXI.Loader.shared.resources['cross'].texture;
        this.redCross = new PIXI.Sprite(redCrossTexture);
        this.redCross.anchor.set(0.5, 1);
        this.redCross.width = this.redCross.height = Settings.WINDOW_WIDTH_PX > Settings.WINDOW_HEIGHT_PX ? Settings.WINDOW_WIDTH_PX / 34 : Settings.WINDOW_HEIGHT_PX / 26;
        this.redCross.roundPixels = true;
        this.redCross.x = this.tutorialTaskWorld.patchLeft.x + this.tutorialTaskWorld.patchLeft.width / 2;
        this.redCross.y = Settings.TRIAL_SCREEN_Y + this.tutorialTaskWorld.patchLeft.height / 1.1;
        this.redCross.tint = RED_TEXT_COLOR;
        this.addChild(this.redCross);

        // set tutorial text based on test type
        if (testType == TestType.MOTION) {
            this.tutorialText.text = t("motion.tutorialTaskScreen.tutorialText", { dotAnimationTime: Settings.DOT_MAX_ANIMATION_TIME / 1000 });
        } else if (testType == TestType.FORM_FIXED) {
            this.tutorialText.text = t("formFixed.tutorialTaskScreen.tutorialText", { lineDisplayTime: Settings.FORM_FIXED_DETECTION_TIME / 1000 });
        } else if (testType == TestType.FORM_RANDOM) {
            this.tutorialText.text = t("formRandom.tutorialTaskScreen.tutorialText");
        }

        // set selected circle
        const circleFilledTexture: PIXI.Texture = PIXI.Loader.shared.resources['circleFilled'].texture;
        this.circles[2].texture = circleFilledTexture;
    }

    update = (delta: number): void => {
        this.tutorialTaskWorld.update(delta);
    }

    backButtonClickHandler = (): void => {
        this.gameApp.changeScreen("tutorialSitDownScreen");
    }

    nextButtonClickHandler = (): void => {
        this.gameApp.changeScreen("tutorialTrialScreen");
    }

    hideDots = (): void => {
        this.tutorialTaskWorld.patchLeftObjectsContainer.visible = false;
        this.tutorialTaskWorld.patchRightObjectsContainer.visible = false;
    }

    touchEndHandler = (e: PIXI.InteractionEvent): void => {
        const finalPoint: PIXI.Point = e.data.getLocalPosition(this.parent);
        const xAbs: number = Math.abs(this.initialPoint.x - finalPoint.x);

        if (xAbs > this.changeScreenDragDistance) {
            if (finalPoint.x < this.initialPoint.x)
                this.gameApp.changeScreen("tutorialTrialScreen");
            else
                this.gameApp.changeScreen("tutorialSitDownScreen");
        }

        this.tutorialTaskWorld.patchLeftObjectsContainer.visible = true;
        this.tutorialTaskWorld.patchRightObjectsContainer.visible = true;
    }

    /**
     * Adds all custom event listeners
     */
    addEventListeners = (): void => {
        this.on("touchmove", this.hideDots);
        this.on("touchend", this.touchEndHandler);
        this.on("touchendoutside", this.touchEndHandler);
        this.backButton.on("click", this.backButtonClickHandler);
        this.backButton.on("touchend", this.backButtonClickHandler);
        this.nextButton.on("click", this.nextButtonClickHandler);
        this.nextButton.on("touchend", this.nextButtonClickHandler);
    }

    /**
     * Removes all custom event listeners
     */
    removeEventListeners = (): void => {
        this.off("touchmove", this.hideDots);
        this.off("touchend", this.touchEndHandler);
        this.off("touchendoutside", this.touchEndHandler);
        this.backButton.off("click", this.backButtonClickHandler);
        this.backButton.off("touchend", this.backButtonClickHandler);
        this.nextButton.off("click", this.nextButtonClickHandler);
        this.nextButton.off("touchend", this.nextButtonClickHandler);
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

        // circles container
        this.circleContainer.x = width / 2 - this.circleContainer.getBounds().width / 2;
        this.circleContainer.y = height - Settings.CIRCLE_BUTTON_TOP_BOTTOM_PADDING / 1.5;

        // tutorial world container
        this.tutorialWorldContainer.x = this.contentX;
        this.tutorialWorldContainer.y = this.contentY + height / 32;
        this.tutorialWorldContainer.width = width;
        this.tutorialWorldContainer.height = height / 2.2;

        // tutorial task world
        this.tutorialTaskWorld.resize();

        // checkmark
        this.greenCheckmark.width = this.greenCheckmark.height = width > height ? width / 34 : height / 26;
        this.greenCheckmark.x = this.tutorialTaskWorld.patchRight.x + this.tutorialTaskWorld.patchRight.width / 2;
        this.greenCheckmark.y = Settings.TRIAL_SCREEN_Y + this.tutorialTaskWorld.patchLeft.height / 1.1;

        // cross
        this.redCross.width = this.redCross.height = width > height ? width / 34 : height / 26;
        this.redCross.x = this.tutorialTaskWorld.patchLeft.x + this.tutorialTaskWorld.patchLeft.width / 2;
        this.redCross.y = Settings.TRIAL_SCREEN_Y + this.tutorialTaskWorld.patchLeft.height / 1.1;

        // patch label
        this.patchLeftLabel.x = this.tutorialTaskWorld.patchLeft.x + this.tutorialTaskWorld.patchLeft.width / 2;
        this.patchLeftLabel.y = this.tutorialTaskWorld.patchLeft.y - height / 16;
        this.patchRightLabel.x = this.tutorialTaskWorld.patchRight.x + this.tutorialTaskWorld.patchRight.width / 2;
        this.patchRightLabel.y = this.tutorialTaskWorld.patchRight.y - height / 16;
        this.patchLeftLabel.style.fontSize = this.patchRightLabel.style.fontSize = Settings.FONT_SIZE * 1.2;
    }

    languageChangeHandler = (): void => {
        const t: TFunction = i18next.t.bind(i18next);
        const testType: TestType = this.gameApp.testType;
        if (testType == TestType.MOTION) {
            this.tutorialText.text = t("motion.tutorialTaskScreen.tutorialText", { dotAnimationTime: Settings.DOT_MAX_ANIMATION_TIME / 1000 });
        } else if (testType == TestType.FORM_FIXED) {
            this.tutorialText.text = t("formFixed.tutorialTaskScreen.tutorialText", { lineDisplayTime: Settings.FORM_FIXED_DETECTION_TIME / 1000 });
        } else if (testType == TestType.FORM_RANDOM) {
            this.tutorialText.text = t("formRandom.tutorialTaskScreen.tutorialText");
        }
        this.header.text = t("tutorialHeader");
        this.patchLeftLabel.text = t("patchLabelOne");
        this.patchRightLabel.text = t("patchLabelTwo");
        this.nextButton.buttonText.text = t("nextButton");
        this.backButton.buttonText.text = t("backButton");
    }
}