import i18next, { TFunction } from 'i18next';
import * as PIXI from 'pixi.js';
import { GameApp } from '../app';
import { TextButton } from '../objects/buttons/TextButton';
import {
    NEXT_BUTTON_COLOR,
    NEXT_BUTTON_HOVER_COLOR,
    NEXT_BUTTON_STROKE_COLOR,
    TEXT_COLOR
} from '../utils/Constants';
import { TestType } from '../utils/Enums';
import { Settings } from '../utils/Settings';
import { TutorialScreen } from './tutorialScreens/TutorialScreen';

export class LandingPageScreen extends TutorialScreen {
    logo: PIXI.Sprite;

    constructor(gameApp: GameApp, testType: TestType) {
        super(gameApp);

        // get language translator
        const t: TFunction = i18next.t.bind(i18next);

        // add logo
        const logoTexture: PIXI.Texture = PIXI.Loader.shared.resources['magnoLogo'].texture;
        this.logo = new PIXI.Sprite(logoTexture);
        this.logo.anchor.set(0.5);
        this.logo.scale.set(Settings.WINDOW_WIDTH_PX / 3400);
        this.logo.position.set(Settings.WINDOW_WIDTH_PX / 2, this.header.y * 1.5);
        this.addChild(this.logo);

        // hide back button
        this.backButton.visible = false;

        // set header text based on test type
        if (testType == TestType.MOTION) {
            this.header.text = t("motion.header");
        } else if (testType == TestType.FORM_FIXED) {
            this.header.text = t("formFixed.header");
        } else if (testType == TestType.FORM_RANDOM) {
            this.header.text = t("formRandom.header");
        }
        this.header.y = this.logo.y + this.logo.height / 2;

        // set tutorial text based on test type
        if (testType == TestType.MOTION) {
            this.tutorialText.text = t("motion.landingPageScreen.tutorialText");
        } else if (testType == TestType.FORM_FIXED) {
            this.tutorialText.text = t("formFixed.landingPageScreen.tutorialText");
        } else if (testType == TestType.FORM_RANDOM) {
            this.tutorialText.text = t("formRandom.landingPageScreen.tutorialText");
        }
        this.tutorialText.anchor.set(0.5);
        this.tutorialText.y = Settings.WINDOW_HEIGHT_PX / 2;
        this.tutorialText.style.wordWrapWidth = Settings.TUTORIAL_TEXT_WIDTH / 1.5;

        // move next button to center
        this.nextButton.x = Settings.WINDOW_WIDTH_PX / 2 - this.nextButton.width / 2;

        // set selected circle
        const circleFilledTexture: PIXI.Texture = PIXI.Loader.shared.resources['circleFilled'].texture;
        this.circles[0].texture = circleFilledTexture;
    }

    update = (delta: number): void => {
        return;
    }

    nextButtonClickHandler = (): void => {
        this.gameApp.changeScreen("tutorialSitDownScreen");
    }

    nextButtonTouchendHandler = (): void => {
        this.gameApp.changeScreen("tutorialSitDownScreen");
    }

    touchEndHandler = (e: PIXI.InteractionEvent): void => {
        const finalPoint: PIXI.Point = e.data.getLocalPosition(this.parent);
        const xAbs: number = Math.abs(this.initialPoint.x - finalPoint.x);

        if (xAbs > this.changeScreenDragDistance) {
            if (finalPoint.x < this.initialPoint.x)
                this.gameApp.changeScreen("tutorialSitDownScreen");
        }
    }

    addEventListeners = (): void => {
        this.on("touchend", this.touchEndHandler);
        this.on("touchendoutside", this.touchEndHandler);
        this.nextButton.on("click", this.nextButtonClickHandler);
        this.nextButton.on("touchend", this.nextButtonTouchendHandler);
    }

    removeEventListeners = (): void => {
        this.off("touchend", this.touchEndHandler);
        this.off("touchendoutside", this.touchEndHandler);
        this.nextButton.off("click", this.nextButtonClickHandler);
        this.nextButton.off("touchend", this.nextButtonClickHandler);
    }

    resize = (width: number, height: number) => {
        // get language translator
        const t: TFunction = i18next.t.bind(i18next);

        // button position
        const nextButtonY: number = height - 1.3 * Settings.CIRCLE_BUTTON_TOP_BOTTOM_PADDING - Settings.TEXT_BUTTON_HEIGHT / 2;

        // background color
        this.backgroundColorSprite.width = width;
        this.backgroundColorSprite.height = height;

        // initial header y position
        this.header.y = height / 16;

        // logo
        this.logo.scale.set(width / 3400);
        this.logo.position.set(width / 2, this.header.y * 1.5);

        // header
        const HEADER_FONT_SIZE: number = Settings.FONT_SIZE * 1.2;
        this.header.style.fontSize = HEADER_FONT_SIZE;
        this.header.style.wordWrapWidth = Settings.HEADER_WIDTH;
        this.header.x = width / 2;
        this.header.y = this.logo.y + this.logo.height / 2;

        // tutorial text
        this.tutorialText.x = width / 2;
        this.tutorialText.y = height / 2;
        this.tutorialText.style.fontSize = Settings.FONT_SIZE * 0.9;
        this.tutorialText.style.wordWrapWidth = Settings.TUTORIAL_TEXT_WIDTH / 1.5;

        // destroy current and create new next button
        this.nextButton.destroy();
        this.nextButton =
            new TextButton(
                width / 2,
                nextButtonY,
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
    }

    /**
     * Updates all text to the current language
     */
    languageChangeHandler = (): void => {
        const t: TFunction = i18next.t.bind(i18next);

        const testType: TestType = this.gameApp.testType;
        if (testType == TestType.MOTION) {
            this.header.text = t("motion.header");
            this.tutorialText.text = t("motion.landingPageScreen.tutorialText");
        } else if (testType == TestType.FORM_FIXED) {
            this.header.text = t("formFixed.header");
            this.tutorialText.text = t("formFixed.landingPageScreen.tutorialText");
        } else if (testType == TestType.FORM_RANDOM) {
            this.header.text = t("formRandom.header");
            this.tutorialText.text = t("formRandom.landingPageScreen.tutorialText");
        }
        this.nextButton.buttonText.text = t("nextButton");
    }
}