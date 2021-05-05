import * as PIXI from "pixi.js";
import {
    RESULTS_GREEN_COLOR,
    RESULTS_ORANGE_COLOR,
    RESULTS_RED_COLOR,
    TEXT_COLOR,
    RESULTS_YELLOW_COLOR
} from "../utils/Constants";
import { Settings } from "../utils/Settings";

export class ResultsBar extends PIXI.Container {
    minLabel: PIXI.Text;
    maxLabel: PIXI.Text;
    minLabelDescription: PIXI.Text;
    maxLabelDescription: PIXI.Text;
    marker: PIXI.Sprite;
    resultBarGradient: PIXI.Sprite = new PIXI.Sprite();

    constructor(x: number, y: number, width: number, height: number) {
        super();
        // padding for labels and label descriptions
        const labelPadding: number = Settings.WINDOW_HEIGHT_PX / 80;

        // create canvas gradient
        let canvas: HTMLCanvasElement = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        let ctx: any = canvas.getContext("2d");
        let gradient: any = ctx?.createLinearGradient(0, 0, width, 0);

        gradient.addColorStop(0, RESULTS_GREEN_COLOR);
        gradient.addColorStop(0.25, RESULTS_YELLOW_COLOR);
        gradient.addColorStop(0.75, RESULTS_ORANGE_COLOR);
        gradient.addColorStop(1, RESULTS_RED_COLOR);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // create texture from canvas and adjust position and size of sprite
        this.resultBarGradient.texture = PIXI.Texture.from(canvas);
        this.resultBarGradient.anchor.set(0.5, 0.5);
        this.resultBarGradient.position.set(x, y);
        this.resultBarGradient.width = width;
        this.resultBarGradient.height = height;
        this.addChild(this.resultBarGradient);

        // add min score label
        this.minLabel = new PIXI.Text("1",
            {
                fontSize: Settings.FONT_SIZE * 1.1,
                fill: TEXT_COLOR,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: Settings.HEADER_WIDTH
            });
        this.minLabel.anchor.set(0.5, 0);
        this.minLabel.position.set(x - this.resultBarGradient.width / 2, y + this.resultBarGradient.height / 2 + labelPadding);
        this.minLabel.roundPixels = true;
        this.addChild(this.minLabel);

        // add max score label
        this.maxLabel = new PIXI.Text("100",
            {
                fontSize: Settings.FONT_SIZE * 1.1,
                fill: TEXT_COLOR,
                align: 'center',
                wordWrap: true,
                wordWrapWidth: Settings.HEADER_WIDTH
            });
        this.maxLabel.anchor.set(0.5, 0);
        this.maxLabel.position.set(x + this.resultBarGradient.width / 2, y + this.resultBarGradient.height / 2 + labelPadding);
        this.maxLabel.roundPixels = true;
        this.addChild(this.maxLabel);

        // add marker
        const markerTexture: PIXI.Texture = PIXI.Loader.shared.resources['resultsBarMarker'].texture;
        this.marker = new PIXI.Sprite(markerTexture);
        this.marker.anchor.set(0.5, 0.5);
        this.marker.x = x;
        this.marker.y = y;
        this.marker.width = this.resultBarGradient.height * 0.5;
        this.marker.height = this.resultBarGradient.height * 1.4;
        this.addChild(this.marker);
    }

    /**
     * Places the marker at the specified value. Rounds to nearest integer.
     * @param value where to place the marker. Between 0-100.
     */
    setMarker = (value: number): void => {
        const stepSize: number = this.resultBarGradient.width / 99;
        this.marker.x = this.resultBarGradient.x - this.resultBarGradient.width / 2 + Math.round(value * stepSize) - stepSize;
    }
}