import i18next, { TFunction } from 'i18next';
import * as PIXI from 'pixi.js';
import { GameApp } from '../../app';
import { TextButton } from '../../objects/buttons/TextButton';
import {
    NEXT_BUTTON_COLOR,
    NEXT_BUTTON_HOVER_COLOR,
    NEXT_BUTTON_STROKE_COLOR,
    TEXT_COLOR
} from '../../utils/Constants';
import { TestType } from '../../utils/Enums';
import { Settings } from '../../utils/Settings';
import { TutorialScreen } from './TutorialScreen';

export class TutorialSitDownScreen extends TutorialScreen {
    private tutorialImage: PIXI.Sprite;

    constructor(gameApp: GameApp, testType: TestType) {
        super(gameApp);

        // get language translator
        const t: TFunction = i18next.t.bind(i18next);

        this.header.text = t("tutorialHeader");

        // add tutorial image
        const tutorialImageTexture: PIXI.Texture = PIXI.Loader.shared.resources['sitDownImage'].texture;
        this.tutorialImage = new PIXI.Sprite(tutorialImageTexture)
        this.tutorialImage.anchor.set(0.5, 0)
        this.tutorialImage.x = this.contentX;
        this.tutorialImage.y = this.contentY + Settings.WINDOW_HEIGHT_PX / 32;
        this.tutorialImage.width = Settings.WINDOW_WIDTH_PX / 3;
        this.tutorialImage.height = Settings.WINDOW_HEIGHT_PX / 2.3;
        this.addChild(this.tutorialImage);

        // add tutorial text
        this.tutorialText.text = t("tutorialSitDownScreen.tutorialText", { screenViewingDistance: Settings.SCREEN_VIEWING_DISTANCE_MM / 10 });

        // set selected circle
        const circleFilledTexture: PIXI.Texture = PIXI.Loader.shared.resources['circleFilled'].texture;
        this.circles[1].texture = circleFilledTexture;
    }

    update = (): void => {
        return;
    }

    nextButtonClickHandler = (): void => {
        this.gameApp.changeScreen("tutorialTaskScreen");
    }

    nextButtonTouchendHandler = (): void => {
        this.gameApp.changeScreen("tutorialTaskScreen");
    }

    backButtonClickHandler = (): void => {
        this.gameApp.changeScreen("landingPageScreen");
    }

    backButtonTouchendHandler = (): void => {
        this.gameApp.changeScreen("landingPageScreen");
    }

    touchEndHandler = (e: PIXI.InteractionEvent): void => {
        const finalPoint: PIXI.Point = e.data.getLocalPosition(this.parent);
        const xAbs: number = Math.abs(this.initialPoint.x - finalPoint.x);

        if (xAbs > this.changeScreenDragDistance) {
            if (finalPoint.x < this.initialPoint.x)
                this.gameApp.changeScreen("tutorialTaskScreen");
            else
                this.gameApp.changeScreen("landingPageScreen");
        }
    }

    /**
     * Adds all custom event listeners
     */
    addEventListeners = (): void => {
        this.on("touchend", this.touchEndHandler);
        this.on("touchendoutside", this.touchEndHandler);
        this.nextButton.on("click", this.nextButtonClickHandler);
        this.nextButton.on("touchend", this.nextButtonTouchendHandler);
        this.backButton.on("click", this.backButtonClickHandler);
        this.backButton.on("touchend", this.backButtonTouchendHandler);
    }

    /**
     * Removes all custom event listeners
     */
    removeEventListeners = (): void => {
        this.off("touchend", this.touchEndHandler);
        this.off("touchendoutside", this.touchEndHandler);
        this.nextButton.off("click", this.nextButtonClickHandler);
        this.nextButton.off("touchend", this.nextButtonClickHandler);
        this.backButton.off("click", this.backButtonClickHandler);
        this.backButton.off("touchend", this.backButtonTouchendHandler);
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

        // tutorial image
        this.tutorialImage.x = this.contentX;
        this.tutorialImage.y = this.contentY + height / 32;
        this.tutorialImage.width = width / 3;
        this.tutorialImage.height = height / 2.3;
    }

    languageChangeHandler = (): void => {
        const t: TFunction = i18next.t.bind(i18next);
        const testType: TestType = this.gameApp.testType;
        if (testType == TestType.MOTION) {
            this.tutorialText.text = t("tutorialSitDownScreen.tutorialText", { screenViewingDistance: Settings.SCREEN_VIEWING_DISTANCE_MM / 10 });
        } else if (testType == TestType.FORM_FIXED) {
            this.tutorialText.text = t("tutorialSitDownScreen.tutorialText", { screenViewingDistance: Settings.SCREEN_VIEWING_DISTANCE_MM / 10 });
        } else if (testType == TestType.FORM_RANDOM) {
            this.tutorialText.text = t("tutorialSitDownScreen.tutorialText", { screenViewingDistance: Settings.SCREEN_VIEWING_DISTANCE_MM / 10 });
        }
        this.header.text = t("tutorialHeader");
        this.nextButton.buttonText.text = t("nextButton");
        this.backButton.buttonText.text = t("backButton");
    }
}