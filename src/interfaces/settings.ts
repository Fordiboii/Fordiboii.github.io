export interface ScreenSettings {
    screen_w_mm: number,
    screen_h_mm: number,
    screen_w_px: number,
    screen_h_px: number,
    viewing_distance: number,
    patch_width: number,
    patch_height: number,
    patch_gap: number
}

export interface MotionSettings {
    dot_amount: number,
    dot_radius: number,
    dot_spacing: number,
    dot_velocity: number,
    dot_coherency: number,
    dot_animation_time: number,
    dot_max_life_time: number,
    dot_kill_percentage: number,
    dot_horizontal_reversal_time: number,
    dot_random_direction_time: number
}

export interface FormSettings {
    form_auto_mode: boolean,
    form_line_amount: number,
    form_diameter_wb: number,
    form_nr_of_circles: number,
    form_circle_gap: number,
    form_line_length: number,
    form_line_height: number,
    form_line_gap: number,
    form_coherency: number,
    form_fixed_detection_time: number,
    form_random_detection_time: number
}

export interface StaircaseSettings {
    stair_correct_db: number,
    stair_wrong_db: number,
    stair_max_tries: number,
    stair_reversal_points: number,
    stair_mean_from_last: number
}

export interface TutorialSettings {
    tutorial_max_trials: number,
    tutorial_dot_coherence_percent: number,
    tutorial_staircase_correct_answer_db: number,
    tutorial_staircase_wrong_answer_db: number
}