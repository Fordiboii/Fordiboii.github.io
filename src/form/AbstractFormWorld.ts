import * as PIXI from "pixi.js";
import { Direction, WorldState } from "../utils/Enums";
import { Patch } from "../objects/Patch";
import { LineSegment } from "../objects/LineSegment";
import { Settings } from "../utils/Settings";
import { PATCH_OUTLINE_THICKNESS } from "../utils/Constants";
import { euclideanDistance } from "../utils/EuclideanDistance";

export abstract class AbstractFormWorld extends PIXI.Container {
    protected currentState: WorldState;
    protected isFixed: boolean;

    protected coherentPatchSide: string;
    public coherencePercent: number;

    public patchLeft: Patch;
    public patchRight: Patch;
    public patchLeftMask: PIXI.Graphics;
    public patchRightMask: PIXI.Graphics;
    public patchGap: number;
    public patchLeftObjectsContainer: PIXI.Container = new PIXI.Container();
    public patchRightObjectsContainer: PIXI.Container = new PIXI.Container();

    protected leftMinX: number;
    protected leftMaxX: number;

    protected patchMinY: number;
    protected patchMaxY: number;

    protected rightMinX: number;
    protected rightMaxX: number;

    public lineSegments: Array<LineSegment> = new Array<LineSegment>();
    public lineSegmentsLeftContainer: PIXI.Container = new PIXI.Container();
    public lineSegmentsRightContainer: PIXI.Container = new PIXI.Container();

    protected runTime: number;
    private maxRunTime: number;

    public correctAnswerCounter: number = 0;
    public wrongAnswerCounter: number = 0;


    constructor(isFixed: boolean) {
        super();
        this.isFixed = isFixed;
        this.currentState = WorldState.PAUSED;
        this.runTime = 0;
        this.coherentPatchSide = Direction[1];
        this.coherencePercent = Settings.FORM_COHERENCY_PERCENTAGE;

        if (isFixed)
            this.maxRunTime = Settings.FORM_FIXED_DETECTION_TIME;
        else
            this.maxRunTime = Settings.FORM_RANDOM_DETECTION_TIME;

        // add containers
        this.patchLeftObjectsContainer.addChild(this.lineSegmentsLeftContainer);
        this.patchRightObjectsContainer.addChild(this.lineSegmentsRightContainer);

        // hide containers by default
        this.patchLeftObjectsContainer.visible = false;
        this.patchRightObjectsContainer.visible = false;
    }

    calculateMaxMin = (): void => {
        this.leftMinX = this.patchLeft.x + PATCH_OUTLINE_THICKNESS;
        this.leftMaxX = this.patchLeft.x + this.patchLeft.width - PATCH_OUTLINE_THICKNESS;

        this.patchMinY = this.patchLeft.y + PATCH_OUTLINE_THICKNESS;
        this.patchMaxY = this.patchLeft.y + this.patchLeft.height - PATCH_OUTLINE_THICKNESS;

        this.rightMinX = this.patchRight.x + PATCH_OUTLINE_THICKNESS;
        this.rightMaxX = this.patchRight.x + this.patchRight.width - PATCH_OUTLINE_THICKNESS;
    }

    createPatchContainerMasks = () => {
        this.patchLeftMask = new PIXI.Graphics()
            .beginFill(0)
            .drawRect(
                this.leftMinX,
                this.patchMinY,
                this.leftMaxX - this.leftMinX,
                this.patchMaxY - this.patchMinY
            )
            .endFill();

        this.patchRightMask = new PIXI.Graphics()
            .beginFill(0)
            .drawRect(
                this.rightMinX,
                this.patchMinY,
                this.rightMaxX - this.rightMinX,
                this.patchMaxY - this.patchMinY
            )
            .endFill()

        this.patchLeftObjectsContainer.mask = this.patchLeftMask;
        this.patchRightObjectsContainer.mask = this.patchRightMask;
        this.addChild(this.patchLeftObjectsContainer, this.patchRightObjectsContainer);
    }

    abstract update(delta: number): void;

    abstract createPatches(): void;

    /**
     * Creates a set number of concentric circles with the line segments aligned to the tangent of a given circle
     * with center x,y and max radius of r. When coherence is lowered, segments of the circle is
     * relocated at a random spot within the same patch. Noise segments are created at random.
     * @param x The x coordinate of the given circle.
     * @param y The y coordinate of the given circle.
     * @param r The radius of the given circle.
     * @param lineLength The length of each line in the concentric circles.
     * @param lineGapOffset The space between each line in the same circle.
     * @param circleGap The space between each concentric circle.
     */
    manualMode(x: number, y: number, r: number, lineLength: number, lineGapOffset: number, circleGap: number): void {
        const lineSegmentTexture: PIXI.Texture = PIXI.Loader.shared.resources['line'].texture;

        let leftCounter: number = 0;
        let rightCounter: number = 0;
        for (let i = 0; i < Settings.FORM_CIRCLES; i++) {
            const start: number = Math.round(Math.random() * 360);
            const maxLines: number = (Math.PI * (r * 2)) / (lineLength + lineGapOffset);
            let gap: number = Math.round((360 / maxLines));
            while (360 % gap != 0 && gap > 0) {
                gap--;
            }
            if (gap <= 0) {
                gap = 1;
            }

            for (let j = start; j < 360 + start; j += gap) {
                const tempX: number = (x + Math.sin(j * Math.PI / 180) * r);
                const tempY: number = (y + Math.cos(j * Math.PI / 180) * r);
                const angle: number = (360 - j);
                const lineSegment: LineSegment = new LineSegment(tempX, tempY, angle, 0, lineSegmentTexture)
                this.lineSegments.push(lineSegment);
                if (this.coherentPatchSide == "LEFT")
                    this.lineSegmentsLeftContainer.addChild(lineSegment);
                else
                    this.lineSegmentsRightContainer.addChild(lineSegment);
            }
            r -= circleGap;
        }
        for (let i = 0; i < (this.lineSegments.length - (this.lineSegments.length * (this.coherencePercent / 100))); i++) {
            let tempX: number;
            let tempY: number;
            if (this.coherentPatchSide == "LEFT") {
                tempX = Math.random() * ((this.patchLeft.x + this.patchLeft.width) - this.patchLeft.x) + this.patchLeft.x;
                tempY = Math.random() * ((this.patchLeft.y + this.patchLeft.height) - this.patchLeft.y) + this.patchLeft.y;
            }
            else {
                tempX = Math.random() * ((this.patchRight.x + this.patchLeft.width) - this.patchRight.x) + this.patchRight.x;
                tempY = Math.random() * ((this.patchRight.y + this.patchRight.height) - this.patchRight.y) + this.patchRight.y;
            }
            this.lineSegments[i].setPosition(tempX, tempY);
            this.lineSegments[i].setAngleOffset(Math.random() * 360);
        }

        if (this.coherentPatchSide == "LEFT")
            leftCounter = this.lineSegments.length;
        else
            rightCounter = this.lineSegments.length;

        while (this.lineSegments.length < Settings.FORM_MAX_AMOUNT * 2) {
            if ((leftCounter) < Settings.FORM_MAX_AMOUNT) {
                const xLeft: number = Math.random() * ((this.patchLeft.x + this.patchLeft.width) - this.patchLeft.x) + this.patchLeft.x;
                const yLeft: number = Math.random() * ((this.patchLeft.y + this.patchLeft.height) - this.patchLeft.y) + this.patchLeft.y;
                const angleLeft: number = Math.random() * 360;
                const lineSegment: LineSegment = new LineSegment(xLeft, yLeft, angleLeft, 0, lineSegmentTexture)
                this.lineSegments.push(lineSegment);
                this.lineSegmentsLeftContainer.addChild(lineSegment);
                leftCounter++;
            }
            if ((rightCounter) < Settings.FORM_MAX_AMOUNT) {
                const xRight: number = Math.random() * ((this.patchRight.x + this.patchLeft.width) - this.patchRight.x) + this.patchRight.x;
                const yRight: number = Math.random() * ((this.patchRight.y + this.patchRight.height) - this.patchRight.y) + this.patchRight.y;
                const angleRight: number = Math.random() * 360;
                const lineSegment: LineSegment = new LineSegment(xRight, yRight, angleRight, 0, lineSegmentTexture)
                this.lineSegments.push(lineSegment);
                this.lineSegmentsRightContainer.addChild(lineSegment);
                rightCounter++;
            }
        }
    }

    /**
     * Creates equally distributed line segments in both patches. Both patches will look the same
     * at 0 percent coherence.
     * Line segments within the confines of the given circle are angled to the tangent of the circle.
     * @param x The x coordinate of the given circle.
     * @param y The y coordinate of the given circle.
     * @param r The radius of the given circle.
     */
    autoMode = (x: number, y: number, r: number): void => {
        const lineSegmentTexture: PIXI.Texture = PIXI.Loader.shared.resources['line'].texture;
        const circle: PIXI.Circle = new PIXI.Circle(x, y, r);
        const h: number = this.patchLeft.height;
        const w: number = this.patchLeft.width;
        const area: number = h * w;
        const pointArea: number = area / Settings.FORM_MAX_AMOUNT;
        const length: number = Math.sqrt(pointArea);

        for (let i = length / 2; i < w; i += length) {
            for (let j = length / 2; j < h; j += length) {
                const angle: number = Math.random() * 360;
                const leftLineSegment: LineSegment = new LineSegment(this.patchLeft.x + i, this.patchLeft.y + j, angle, 0, lineSegmentTexture);
                const rightLineSegment: LineSegment = new LineSegment(this.patchRight.x + i, this.patchRight.y + j, angle, 0, lineSegmentTexture);
                this.lineSegments.push(leftLineSegment, rightLineSegment);
                this.lineSegmentsLeftContainer.addChild(leftLineSegment);
                this.lineSegmentsRightContainer.addChild(rightLineSegment);
            }
        }

        let circleSegments: Array<LineSegment> = new Array<LineSegment>();
        for (let i = 0; i < this.lineSegments.length; i++) {
            const lineSegment: LineSegment = this.lineSegments[i];
            if (circle.contains(lineSegment.x, lineSegment.y)) {
                circleSegments.push(this.lineSegments[i]);
            }
        }
        this.lineSegments.filter(segment => !circleSegments.includes(segment));

        for (let i = 1; i < circleSegments.length; i++) {
            for (let j = i - 1; (j >= 0 && euclideanDistance(circleSegments[j + 1].x, circleSegments[j + 1].y, x, y) > euclideanDistance(circleSegments[j].x, circleSegments[j].y, x, y)); j--) {
                circleSegments[j + 1] = circleSegments.splice(j, 1, circleSegments[j + 1])[0];
            }
        }

        // makes it so the center of the concentric circle is not a circle
        for (let i = circleSegments.length - 4; i > (circleSegments.length - (circleSegments.length * (this.coherencePercent / 100))); i--) {
            const lineSegment: LineSegment = circleSegments[i];
            let angle: number = 180 / Math.PI * (Math.atan2(circle.y - lineSegment.y, circle.x - lineSegment.x));
            angle += 90;
            lineSegment.angle = angle;
        }

        this.lineSegments = this.lineSegments.concat(circleSegments);
        circleSegments = [];
    }

    paused = (): void => {
        // only hide line segments if test type is fixed
        if (this.isFixed) {
            this.patchLeftObjectsContainer.visible = false;
            this.patchRightObjectsContainer.visible = false;
        }
        if (this.runTime >= this.maxRunTime) {
            this.runTime = 0;
        }
    }

    running = (delta: number): void => {
        this.runTime += delta;
        if (this.runTime >= this.maxRunTime) {
            this.currentState = WorldState.PAUSED;
        }
    }

    getState = (): WorldState => {
        return this.currentState;
    }

    setState = (state: WorldState): void => {
        this.currentState = state;
    }

    getCoherentPatchSide = (): string => {
        return this.coherentPatchSide;
    }

    getCoherencePercent = (): number => {
        return this.coherencePercent;
    }
}