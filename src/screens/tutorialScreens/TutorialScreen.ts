import i18next, { TFunction } from 'i18next';
import * as PIXI from 'pixi.js';
import { GameApp } from '../../app';
import { SpriteButton } from '../../objects/buttons/SpriteButton';
import { TextButton } from '../../objects/buttons/TextButton';
import {
    SPRITE_BUTTON_HOVER_COLOR,
    TEXT_COLOR,
    NEXT_BUTTON_COLOR,
    NEXT_BUTTON_HOVER_COLOR,
    BACKGROUND_COLOR,
    NEXT_BUTTON_STROKE_COLOR
} from '../../utils/Constants';
import { Settings } from '../../utils/Settings';

export abstract class TutorialScreen extends PIXI.Container {
    public gameApp: GameApp;
    protected backgroundColorSprite: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    protected header: PIXI.Text;
    protected tutorialText: PIXI.Text;
    protected circleContainer: PIXI.Sprite = new PIXI.Sprite();
    protected circles: Array<PIXI.Sprite> = new Array<PIXI.Sprite>();
    protected backButton: TextButton;
    protected nextButton: TextButton;

    // variables for storing x and y positions of tutorial content (image or motion world) and tutorial text
    protected contentX: number;
    protected contentY: number;
    protected tutorialTextX: number;
    protected tutorialTextY: number;

    // to handle touch drag events
    protected initialPoint: PIXI.Point;
    protected maxDragDistance: number = Settings.WINDOW_WIDTH_PX / 5;
    protected changeScreenDragDistance: number = Settings.WINDOW_WIDTH_PX / 16;

    constructor(gameApp: GameApp) {
        super();
        // reference to game object
        this.gameApp = gameApp;

        // get language translator
        const t: TFunction = i18next.t.bind(i18next);

        // make interactive to detect touch drag event
        this.interactive = true;

        // button positions
        const backButtonX: number = Settings.WINDOW_WIDTH_PX / 2 - Settings.NEXT_BACK_BUTTON_SPACING;
        const nextButtonX: number = Settings.WINDOW_WIDTH_PX / 2 + Settings.NEXT_BACK_BUTTON_SPACING;
        const backAndNextButtonY: number = Settings.WINDOW_HEIGHT_PX - 1.3 * Settings.CIRCLE_BUTTON_TOP_BOTTOM_PADDING - Settings.TEXT_BUTTON_HEIGHT / 2;

        // add background color
        this.backgroundColorSprite.width = Settings.WINDOW_WIDTH_PX;
        this.backgroundColorSprite.height = Settings.WINDOW_HEIGHT_PX;
        this.backgroundColorSprite.tint = BACKGROUND_COLOR;
        this.addChild(this.backgroundColorSprite);

        // add header
        const HEADER_FONT_SIZE: number = Settings.FONT_SIZE * 1.2;
        this.header = new PIXI.Text("",
            {
                fontSize: HEADER_FONT_SIZE,
                fill: TEXT_COLOR,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: Settings.HEADER_WIDTH,
                lineHeight: 0
            }
        );
        this.header.anchor.set(0.5, 0);
        this.header.x = Settings.WINDOW_WIDTH_PX / 2;
        this.header.y = Settings.WINDOW_HEIGHT_PX / 16;
        this.header.roundPixels = true;
        this.addChild(this.header);

        // content and tutorial text positions
        this.contentX = Settings.WINDOW_WIDTH_PX / 2;
        this.contentY = Settings.WINDOW_HEIGHT_PX / 12 + this.header.height;
        this.tutorialTextX = Settings.WINDOW_WIDTH_PX / 2;
        this.tutorialTextY = this.contentY + Settings.WINDOW_HEIGHT_PX / 2;

        // add tutorial text
        this.tutorialText = new PIXI.Text("",
            {
                fontSize: Settings.FONT_SIZE * 0.9,
                fill: TEXT_COLOR,
                align: 'left',
                wordWrap: true,
                wordWrapWidth: Settings.TUTORIAL_TEXT_WIDTH,
                lineHeight: 0
            }
        );
        this.tutorialText.anchor.set(0.5, 0);
        this.tutorialText.x = this.tutorialTextX;
        this.tutorialText.y = this.tutorialTextY;
        this.addChild(this.tutorialText);

        // add back button
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
        this.addChild(this.backButton);

        // add next button
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
        this.addChild(this.nextButton);

        // add circles
        const circleHollowTexture: PIXI.Texture = PIXI.Loader.shared.resources['circleHollow'].texture;
        for (let i = 0; i < 4; i++) {
            const circle: SpriteButton =
                new SpriteButton(
                    i * Settings.CIRCLE_BUTTON_WIDTH * 2,
                    0,
                    Settings.CIRCLE_BUTTON_WIDTH,
                    Settings.CIRCLE_BUTTON_WIDTH,
                    circleHollowTexture,
                    [0, 0.5],
                    SPRITE_BUTTON_HOVER_COLOR
                );
            this.circles.push(circle);
            this.circleContainer.addChild(circle);
        }
        this.circleContainer.x = Settings.WINDOW_WIDTH_PX / 2 - this.circleContainer.getBounds().width / 2;
        this.circleContainer.y = Settings.WINDOW_HEIGHT_PX - Settings.CIRCLE_BUTTON_TOP_BOTTOM_PADDING / 1.5;
        this.addChild(this.circleContainer);

        // add circle event handlers
        this.circles[0].on("click", this.firstCircleClickHandler);
        this.circles[1].on("click", this.secondCircleClickHandler);
        this.circles[2].on("click", this.thirdCircleClickHandler);
        this.circles[3].on("click", this.fourthCircleClickHandler);

        // add container drag event handlers
        this.on("touchstart", this.touchStartHandler);
        this.on("touchmove", this.touchDragHandler);
        this.on("touchend", this.resetPosition);
        this.on("touchendoutside", this.resetPosition);
    }

    firstCircleClickHandler = (): void => {
        if (this.gameApp.currentScreen !== this.gameApp.screens.landingPageScreen) {
            this.gameApp.changeScreen("landingPageScreen");
        }
    }

    secondCircleClickHandler = (): void => {
        if (this.gameApp.currentScreen !== this.gameApp.screens.tutorialSitDownScreen) {
            this.gameApp.changeScreen("tutorialSitDownScreen");
        }
    }

    thirdCircleClickHandler = (): void => {
        if (this.gameApp.currentScreen !== this.gameApp.screens.tutorialTaskScreen) {
            this.gameApp.changeScreen("tutorialTaskScreen");
        }
    }

    fourthCircleClickHandler = (): void => {
        if (this.gameApp.currentScreen !== this.gameApp.screens.tutorialTrialScreen) {
            this.gameApp.changeScreen("tutorialTrialScreen");
        }
    }

    touchStartHandler = (e: PIXI.InteractionEvent): void => {
        this.initialPoint = e.data.getLocalPosition(this.parent);
    }

    touchDragHandler = (e: PIXI.InteractionEvent): void => {
        const nextPoint: PIXI.Point = e.data.getLocalPosition(this.parent);
        const xAbs: number = Math.abs(this.initialPoint.x - nextPoint.x);

        // move container
        this.x = xAbs < this.maxDragDistance ? e.data.global.x - this.initialPoint.x : this.x;
    }

    resetPosition = (): void => {
        this.x = 0;
    }

    abstract update(delta: number): void;

    abstract removeEventListeners(): void;
}