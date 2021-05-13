import i18next, { TFunction } from "i18next";
import * as PIXI from "pixi.js";
import { BACKGROUND_COLOR, TEXT_COLOR } from "../utils/Constants";
import { Settings } from "../utils/Settings";

export class MobileScreen extends PIXI.Container {
    backgroundColorSprite: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    mobileSprite: PIXI.Sprite;
    tabletSprite: PIXI.Sprite;
    desktopSprite: PIXI.Sprite;
    abortSprite: PIXI.Sprite;
    checkMarkSprite1: PIXI.Sprite;
    checkMarkSprite2: PIXI.Sprite;
    warningText: PIXI.Text;

    constructor() {
        super();
        // get language translator
        const t: TFunction = i18next.t.bind(i18next);

        const width: number = Settings.WINDOW_WIDTH_PX;
        const height: number = Settings.WINDOW_HEIGHT_PX;

        // create abort and checkmark sprites
        this.abortSprite = PIXI.Sprite.from("../assets/sprites/abort.png");
        this.abortSprite.anchor.set(0.5, 1);
        this.abortSprite.width = this.abortSprite.height = width > height ? width * 0.3 : height * 0.3;
        this.checkMarkSprite1 = PIXI.Sprite.from("../assets/sprites/green-checkmark-line.png");
        this.checkMarkSprite1.anchor.set(0.5, 1);
        this.checkMarkSprite1.width = this.checkMarkSprite1.height = width > height ? width * 0.3 : height * 0.2;
        this.checkMarkSprite2 = PIXI.Sprite.from("../assets/sprites/green-checkmark-line.png");
        this.checkMarkSprite2.anchor.set(0.5, 1);
        this.checkMarkSprite2.width = this.checkMarkSprite2.height = width > height ? width * 0.3 : height * 0.2;

        // add background color
        this.backgroundColorSprite.width = width;
        this.backgroundColorSprite.height = height;
        this.backgroundColorSprite.tint = BACKGROUND_COLOR;
        this.addChild(this.backgroundColorSprite);

        // add mobile device sprite
        this.mobileSprite = PIXI.Sprite.from("../assets/sprites/mobile-phone.png");
        this.mobileSprite.anchor.set(0.5, 1);
        this.mobileSprite.x = width / 2;
        this.mobileSprite.y = height / 4;
        this.mobileSprite.width = width * 0.15;
        this.mobileSprite.height = height * 0.15;
        this.abortSprite.y = -150;
        this.mobileSprite.addChild(this.abortSprite);
        this.addChild(this.mobileSprite)

        // add text
        this.warningText = new PIXI.Text(t("mobileScreen.warning"),
            {
                fontSize: Settings.FONT_SIZE * 3,
                fill: TEXT_COLOR,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: Settings.TUTORIAL_TEXT_WIDTH,
                lineHeight: 0
            }
        );
        this.warningText.anchor.set(0.5, 0.5);
        this.warningText.x = this.mobileSprite.x;
        this.warningText.y = height / 2;
        this.warningText.roundPixels = true;
        this.addChild(this.warningText);

        // add desktop and tablet sprites
        const desktopTabletSpacing: number = width / 6;

        this.desktopSprite = PIXI.Sprite.from("./assets/sprites/computer-laptop.png");
        this.desktopSprite.anchor.set(0.5, 1);
        this.desktopSprite.x = this.mobileSprite.x - desktopTabletSpacing;
        this.desktopSprite.y = height * 7 / 8;
        this.desktopSprite.width = width * 0.4;
        this.desktopSprite.height = height * 0.15;
        this.checkMarkSprite1.y = -this.desktopSprite.height;
        this.desktopSprite.addChild(this.checkMarkSprite1);
        this.addChild(this.desktopSprite);

        this.tabletSprite = PIXI.Sprite.from("./assets/sprites/device-tablet.png");
        this.tabletSprite.anchor.set(0.5, 1);
        this.tabletSprite.x = this.mobileSprite.x + desktopTabletSpacing;
        this.tabletSprite.y = this.desktopSprite.y;
        this.tabletSprite.width = width * 0.18;
        this.tabletSprite.height = height * 0.15;
        this.checkMarkSprite2.y = -2 * this.tabletSprite.height;
        this.tabletSprite.addChild(this.checkMarkSprite2);
        this.addChild(this.tabletSprite);
    }

    update = (delta: number): void => {
        return;
    }

    addEventListeners = (): void => {
        return;
    }

    removeEventListeners = (): void => {
        return;
    }

    resize = (width: number, height: number) => {
        // background color
        this.backgroundColorSprite.width = width;
        this.backgroundColorSprite.height = height;

        // mobile device sprite
        this.mobileSprite.x = width / 2;
        this.mobileSprite.y = height / 4;
        this.mobileSprite.width = width * 0.15;
        this.mobileSprite.height = height * 0.15;

        // text
        this.warningText.style.fontSize = Settings.FONT_SIZE * 3;
        this.warningText.style.wordWrapWidth = Settings.TUTORIAL_TEXT_WIDTH;
        this.warningText.x = this.mobileSprite.x;
        this.warningText.y = height / 2;

        // desktop and tablet sprites
        const desktopTabletSpacing: number = width / 6;

        this.desktopSprite.x = this.mobileSprite.x - desktopTabletSpacing;
        this.desktopSprite.y = height * 7 / 8;
        this.desktopSprite.width = width * 0.4;
        this.desktopSprite.height = height * 0.15;

        this.tabletSprite.x = this.mobileSprite.x + desktopTabletSpacing;
        this.tabletSprite.y = this.desktopSprite.y;
        this.tabletSprite.width = width * 0.18;
        this.tabletSprite.height = height * 0.15;
    }

    languageChangeHandler = (): void => {
        const t: TFunction = i18next.t.bind(i18next);
        this.warningText.text = t("mobileScreen.warning");
    }
}