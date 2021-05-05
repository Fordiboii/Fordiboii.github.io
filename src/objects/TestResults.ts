import { Trial } from "../interfaces/trial";
import { TestType } from "../utils/Enums";
import { Psychophysics } from "../utils/Psychophysics";
import { Settings } from "../utils/Settings";
import {
    ScreenSettings,
    MotionSettings,
    FormSettings,
    StaircaseSettings,
    TutorialSettings
} from "../interfaces/settings";

export class TestResults {
    testType: string;

    correctAnswers: number;
    wrongAnswers: number;

    threshold: number;
    lowestCoherency: number = 100;

    trials: Array<Trial> = new Array<Trial>();
    reversalValues: Array<number> = new Array<number>();
    screenSettings: ScreenSettings;
    motionSettings: MotionSettings;
    formSettings: FormSettings;
    staircaseSettings: StaircaseSettings;
    tutorialSettings: TutorialSettings;

    constructor(testType: TestType, trials: Array<Trial>, reversalPoints: Array<number>, correctAnswers: number, wrongAnswers: number) {
        this.testType = TestType[testType];
        this.trials = trials;

        this.correctAnswers = correctAnswers;
        this.wrongAnswers = wrongAnswers;

        this.threshold = Psychophysics.geometricMean(reversalPoints, Settings.STAIRCASE_REVERSALS_TO_CALCULATE_MEAN);

        for (let i = 0; i < reversalPoints.length; i++) {
            if (reversalPoints[i] < this.lowestCoherency) {
                this.lowestCoherency = reversalPoints[i];
            }
            this.reversalValues.push(reversalPoints[i]);
        }

        // add screen settings
        this.screenSettings = {
            screen_w_mm: Settings.WINDOW_WIDTH_MM,
            screen_w_px: Settings.WINDOW_WIDTH_PX,
            screen_h_mm: Settings.WINDOW_HEIGHT_MM,
            screen_h_px: Settings.WINDOW_HEIGHT_PX,
            viewing_distance: Settings.SCREEN_VIEWING_DISTANCE_MM,
            patch_width: Settings.PATCH_WIDTH,
            patch_height: Settings.PATCH_HEIGHT,
            patch_gap: Settings.PATCH_GAP
        }

        // add motion or form settings
        if (testType == TestType.MOTION) {
            this.motionSettings = {
                dot_amount: Settings.DOT_TOTAL_AMOUNT,
                dot_radius: Settings.DOT_RADIUS,
                dot_spacing: Settings.DOT_SPACING,
                dot_velocity: Settings.DOT_VELOCITY,
                dot_coherency: Settings.DOT_COHERENCE_PERCENTAGE,
                dot_animation_time: Settings.DOT_MAX_ANIMATION_TIME,
                dot_max_life_time: Settings.DOT_MAX_ALIVE_TIME,
                dot_kill_percentage: Settings.DOT_KILL_PERCENTAGE,
                dot_horizontal_reversal_time: Settings.DOT_HORIZONTAL_REVERSAL_TIME,
                dot_random_direction_time: Settings.DOT_RANDOM_DIRECTION_TIME
            }
        } else {
            this.formSettings = {
                form_auto_mode: Settings.FORM_AUTO_MODE,
                form_circle_gap: Settings.FORM_CIRCLES_GAP,
                form_coherency: Settings.FORM_COHERENCY_PERCENTAGE,
                form_diameter_wb: Settings.FORM_DIAMETER_WB,
                form_line_amount: Settings.FORM_MAX_AMOUNT,
                form_line_gap: Settings.FORM_LINE_GAP,
                form_line_height: Settings.FORM_LINE_HEIGHT,
                form_line_length: Settings.FORM_LINE_LENGTH,
                form_nr_of_circles: Settings.FORM_CIRCLES,
                form_fixed_detection_time: Settings.FORM_FIXED_DETECTION_TIME,
                form_random_detection_time: Settings.FORM_RANDOM_DETECTION_TIME
            }
        }

        // add staircase settings
        this.staircaseSettings = {
            stair_correct_db: Settings.STAIRCASE_CORRECT_ANSWER_DB,
            stair_wrong_db: Settings.STAIRCASE_WRONG_ANSWER_DB,
            stair_max_tries: Settings.STAIRCASE_MAX_ATTEMPTS,
            stair_reversal_points: Settings.STAIRCASE_REVERSAL_POINTS,
            stair_mean_from_last: Settings.STAIRCASE_REVERSALS_TO_CALCULATE_MEAN
        }

        // add tutorial settings
        this.tutorialSettings = {
            tutorial_dot_coherence_percent: Settings.DOT_TUTORIAL_COHERENCE_PERCENTAGE,
            tutorial_max_trials: Settings.TRIAL_MAX_STEPS,
            tutorial_staircase_correct_answer_db: Settings.TUTORIAL_STAIRCASE_CORRECT_ANSWER_DB,
            tutorial_staircase_wrong_answer_db: Settings.TUTORIAL_STAIRCASE_WRONG_ANSWER_DB
        }
    }
}