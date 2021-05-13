import * as PIXI from "pixi.js";
import { BACKGROUND_COLOR, LOADING_SPINNER_COLOR, NEXT_BUTTON_COLOR } from "../utils/Constants";

export class LoadingScreen extends PIXI.Container {
    backgroundColorSprite: PIXI.Sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    logo: PIXI.Sprite;
    loadingSpinner: PIXI.Graphics;

    constructor() {
        super();
        const width: number = window.innerWidth;
        const height: number = window.innerHeight;

        // add background color
        this.backgroundColorSprite.width = width;
        this.backgroundColorSprite.height = height;
        this.backgroundColorSprite.tint = BACKGROUND_COLOR;
        this.addChild(this.backgroundColorSprite);

        // add logo
        this.logo = PIXI.Sprite.from("../assets/images/magnologo.png");
        this.logo.anchor.set(0.5);
        this.logo.scale.set(width / 2800);
        this.logo.position.set(width / 2, height / 2 - height / 12);
        this.addChild(this.logo);

        // add loading spinner
        this.loadingSpinner = new PIXI.Graphics();
        this.loadingSpinner.position.set(width / 2, height / 2 + height / 8);
        this.loadingSpinner.lineStyle(width / 130, NEXT_BUTTON_COLOR, 0.5);
        this.loadingSpinner.drawCircle(0, 0, width / 50);
        this.loadingSpinner.lineStyle(width / 130, LOADING_SPINNER_COLOR);
        this.loadingSpinner.arc(0, 0, width / 50, 0, Math.PI / 4);
        this.loadingSpinner.cacheAsBitmap = true;
        this.addChild(this.loadingSpinner);
    }

    update = (delta: number): void => {
        // rotate spinner
        this.loadingSpinner.rotation = (this.loadingSpinner.rotation + Math.PI / 30) % (2 * Math.PI);
    }

    addEventListeners = (): void => {
        return;
    }

    removeEventListeners = (): void => {
        return;
    }

    resize = (width: number, height: number): void => {
        // background color
        this.backgroundColorSprite.width = width;
        this.backgroundColorSprite.height = height;

        // logo
        this.logo.scale.set(width / 2800);
        this.logo.position.set(width / 2, height / 2 - height / 12);

        // loading spinner
        this.loadingSpinner.position.set(width / 2, height / 2 + height / 8);
    }

    languageChangeHandler = (): void => {
        return;
    }
}