import * as PIXI from "pixi.js";
import { DropShadowFilter } from "pixi-filters";
import {
    BUTTON_DISABLED_COLOR,
    BUTTON_DISABLED_STROKE_COLOR,
    TEXT_BUTTON_DROP_SHADOW_ANGLE,
    TEXT_BUTTON_DROP_SHADOW_BLUR,
    TEXT_BUTTON_DROP_SHADOW_COLOR,
    TEXT_BUTTON_DROP_SHADOW_DISTANCE,
    TEXT_COLOR
} from "../../utils/Constants";
import { Settings } from "../../utils/Settings";

export class TextButton extends PIXI.Container {
    button: PIXI.Graphics = new PIXI.Graphics();
    buttonText: PIXI.Text;

    buttonWidth: number;
    buttonHeight: number;
    isMouseDown: boolean = false;
    color: number;
    buttonTextColor: number;
    hoverColor: number | undefined;
    disabled: boolean;
    radius: number;

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        color: number,
        strokeColor?: number,
        buttonText?: string,
        buttonTextColor: number = TEXT_COLOR,
        hoverColor?: number,
        disabled: boolean = false,
        strokeWidth: number = 3,
        radius: number = Settings.TEXT_BUTTON_ROUNDING_RADIUS,
        fontSize: number = Settings.FONT_SIZE
    ) {
        super();
        this.buttonWidth = width;
        this.buttonHeight = height;
        this.color = color;
        this.buttonTextColor = buttonTextColor;
        this.disabled = disabled;
        this.radius = radius;
        if (hoverColor) this.hoverColor = hoverColor;
        if (strokeColor) this.button.lineStyle(strokeWidth, strokeColor);

        this.addChild(this.button)
        this.interactive = disabled ? false : true;
        this.buttonMode = disabled ? false : true;
        this.position.set(x - width / 2, y - height / 2)
        this.button.beginFill(color)
            .drawRoundedRect(0, 0, width, height, radius)
            .endFill();

        if (buttonText) {
            const onClickTextOffset: number = 3;
            const initialTextY: number = height / 2;
            const onClickTextY: number = initialTextY + onClickTextOffset;
            this.buttonText = new PIXI.Text(
                buttonText,
                {
                    fontName: "Helvetica-Normal",
                    fontSize: fontSize,
                    fill: buttonTextColor
                }
            );
            this.buttonText.roundPixels = true;
            this.buttonText.anchor.set(0.5);
            this.buttonText.x = width / 2;
            this.buttonText.y = initialTextY;
            this.addChild(this.buttonText);

            this.on("mousedown", (): void => {
                if (!this.isMouseDown) {
                    this.buttonText.y = onClickTextY;
                    this.isMouseDown = true;
                }
            });

            this.on("mouseup", (): void => {
                if (this.isMouseDown) {
                    this.buttonText.y = initialTextY;
                    this.isMouseDown = false;
                }
            });

            this.on("mouseout", (): void => {
                if (this.isMouseDown) {
                    this.buttonText.y = initialTextY;
                }
            });

            this.on("mouseover", (): void => {
                if (this.isMouseDown) {
                    this.buttonText.y = onClickTextY;
                }
            });

            this.on("mouseupoutside", (): void => {
                this.isMouseDown = false;
            });

            this.on("touchstart", (): void => {
                if (!this.isMouseDown) {
                    this.buttonText.y = onClickTextY;
                    this.isMouseDown = true;
                }
            });

            this.on("touchmove", (e: TouchEvent): void => {
                if (e.target == null) {
                    if (this.isMouseDown) {
                        this.buttonText.y = initialTextY;
                        this.isMouseDown = false;
                    }
                }
            });

            this.on("touchend", (): void => {
                if (this.isMouseDown) {
                    this.buttonText.y = initialTextY;
                    this.isMouseDown = false;
                }
            });
        }

        if (hoverColor) {
            this.on("mouseover", (): void => {
                this.button.clear();
                if (strokeColor) this.button.lineStyle(strokeWidth, strokeColor);
                this.button.beginFill(hoverColor)
                    .drawRoundedRect(0, 0, width, height, radius)
                    .endFill();
            });
            this.on("mouseout", (): void => {
                this.button.clear();
                if (strokeColor) this.button.lineStyle(strokeWidth, strokeColor);
                this.button.beginFill(color)
                    .drawRoundedRect(0, 0, width, height, radius)
                    .endFill();
            });
            this.on("touchstart", (): void => {
                this.button.clear();
                if (strokeColor) this.button.lineStyle(strokeWidth, strokeColor);
                this.button.beginFill(hoverColor)
                    .drawRoundedRect(0, 0, width, height, radius)
                    .endFill();
            });
            this.on("touchmove", (e: TouchEvent): void => {
                if (e.target == null) {
                    this.button.clear();
                    if (strokeColor) this.button.lineStyle(strokeWidth, strokeColor);
                    this.button.beginFill(color)
                        .drawRoundedRect(0, 0, width, height, radius)
                        .endFill();
                }
            });
            this.on("touchend", (): void => {
                this.button.clear();
                if (strokeColor) this.button.lineStyle(strokeWidth, strokeColor);
                this.button.beginFill(color)
                    .drawRoundedRect(0, 0, width, height, radius)
            });
        }

        // adds button shadow
        this.button.filters = [
            new DropShadowFilter({
                rotation: TEXT_BUTTON_DROP_SHADOW_ANGLE,
                distance: TEXT_BUTTON_DROP_SHADOW_DISTANCE,
                blur: TEXT_BUTTON_DROP_SHADOW_BLUR,
                color: TEXT_BUTTON_DROP_SHADOW_COLOR
            })
        ];
    }

    /**
     * Makes the button gray and non-clickable.
     */
    disable = (withStroke?: boolean, strokeWidth = 3): void => {
        this.buttonText.alpha = 0.5;
        this.interactive = false;
        this.buttonMode = false;
        this.button.clear();
        if (withStroke) this.button.lineStyle(strokeWidth, BUTTON_DISABLED_STROKE_COLOR);
        this.button.beginFill(BUTTON_DISABLED_COLOR)
            .drawRoundedRect(0, 0, this.buttonWidth, this.buttonHeight, this.radius)
            .endFill();
        this.button.filters = [];
    }
}