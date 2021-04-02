import * as PIXI from "pixi.js";
import { DropShadowFilter } from "pixi-filters";
import {
    BUTTON_DISABLED_COLOR,
    BUTTON_DISABLED_STROKE_COLOR,
    FONT_SIZE,
    TEXT_BUTTON_DROP_SHADOW_ANGLE,
    TEXT_BUTTON_DROP_SHADOW_BLUR,
    TEXT_BUTTON_DROP_SHADOW_COLOR,
    TEXT_BUTTON_DROP_SHADOW_DISTANCE,
    TEXT_BUTTON_ROUNDING_RADIUS,
    TEXT_COLOR
} from "../../utils/Constants";

export class TextButton extends PIXI.Container {
    button: PIXI.Graphics = new PIXI.Graphics();
    text: PIXI.Text;

    buttonWidth: number;
    buttonHeight: number;
    isMouseDown: boolean = false;
    color: number;
    buttonTextColor: number;
    hoverColor: number | undefined;
    disabled: boolean;

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
        strokeWidth: number = 3
    ) {
        super();
        this.buttonWidth = width;
        this.buttonHeight = height;
        this.color = color;
        this.buttonTextColor = buttonTextColor;
        this.disabled = disabled;
        if (hoverColor) this.hoverColor = hoverColor;
        if (strokeColor) this.button.lineStyle(strokeWidth, strokeColor);

        this.addChild(this.button)
        this.interactive = disabled ? false : true;
        this.buttonMode = disabled ? false : true;
        this.position.set(x - width / 2, y - height / 2)
        this.button.beginFill(color)
            .drawRoundedRect(0, 0, width, height, TEXT_BUTTON_ROUNDING_RADIUS)
            .endFill();

        if (buttonText) {
            const onClickTextOffset: number = 3;
            this.text = new PIXI.Text(
                buttonText,
                {
                    fontName: "Helvetica-Normal",
                    fontSize: FONT_SIZE,
                    fill: buttonTextColor
                }
            );
            this.text.roundPixels = true;
            this.text.anchor.set(0.5);
            this.text.x = width / 2;
            this.text.y = height / 2;
            this.addChild(this.text);

            this.on("mousedown", (): void => {
                if (!this.isMouseDown) {
                    this.text.y += onClickTextOffset;
                    this.isMouseDown = true;
                }
            });

            this.on("mouseup", (): void => {
                if (this.isMouseDown) {
                    this.text.y -= onClickTextOffset;
                    this.isMouseDown = false;
                }
            });

            this.on("mouseout", (): void => {
                if (this.isMouseDown) {
                    this.text.y -= onClickTextOffset;
                }
            });

            this.on("mouseover", (): void => {
                if (this.isMouseDown) {
                    this.text.y += onClickTextOffset;
                }
            });

            this.on("mouseupoutside", (): void => {
                this.isMouseDown = false;
            });

            this.on("touchstart", (): void => {
                if (!this.isMouseDown) {
                    this.text.y += onClickTextOffset;
                    this.isMouseDown = true;
                }
            });

            this.on("touchmove", (e: TouchEvent): void => {
                if (e.target == null) {
                    if (this.isMouseDown) {
                        this.text.y -= onClickTextOffset;
                        this.isMouseDown = false;
                    }
                }
            });

            this.on("touchend", (): void => {
                if (this.isMouseDown) {
                    this.text.y -= onClickTextOffset;
                    this.isMouseDown = false;
                }
            });
        }

        if (hoverColor) {
            this.on("mouseover", (): void => {
                this.button.clear();
                if (strokeColor) this.button.lineStyle(strokeWidth, strokeColor);
                this.button.beginFill(hoverColor)
                    .drawRoundedRect(0, 0, width, height, TEXT_BUTTON_ROUNDING_RADIUS)
                    .endFill();
            });
            this.on("mouseout", (): void => {
                this.button.clear();
                if (strokeColor) this.button.lineStyle(strokeWidth, strokeColor);
                this.button.beginFill(color)
                    .drawRoundedRect(0, 0, width, height, TEXT_BUTTON_ROUNDING_RADIUS)
                    .endFill();
            });
            this.on("touchstart", (): void => {
                this.button.clear();
                if (strokeColor) this.button.lineStyle(strokeWidth, strokeColor);
                this.button.beginFill(hoverColor)
                    .drawRoundedRect(0, 0, width, height, TEXT_BUTTON_ROUNDING_RADIUS)
                    .endFill();
            });
            this.on("touchmove", (e: TouchEvent): void => {
                if (e.target == null) {
                    this.button.clear();
                    if (strokeColor) this.button.lineStyle(strokeWidth, strokeColor);
                    this.button.beginFill(color)
                        .drawRoundedRect(0, 0, width, height, TEXT_BUTTON_ROUNDING_RADIUS)
                        .endFill();
                }
            });
            this.on("touchend", (): void => {
                this.button.clear();
                if (strokeColor) this.button.lineStyle(strokeWidth, strokeColor);
                this.button.beginFill(color)
                    .drawRoundedRect(0, 0, width, height, TEXT_BUTTON_ROUNDING_RADIUS)
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
        this.text.alpha = 0.5;
        this.interactive = false;
        this.buttonMode = false;
        this.button.clear();
        if (withStroke) this.button.lineStyle(strokeWidth, BUTTON_DISABLED_STROKE_COLOR);
        this.button.beginFill(BUTTON_DISABLED_COLOR)
            .drawRoundedRect(0, 0, this.buttonWidth, this.buttonHeight, TEXT_BUTTON_ROUNDING_RADIUS)
            .endFill();
        this.button.filters = [];
    }
}