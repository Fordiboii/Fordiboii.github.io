export interface Trial {
    selectedPatch: "LEFT" | "RIGHT", // the patch selected
    coherentPatch: "LEFT" | "RIGHT", // the patch with coherently moving dots or concentric circles.
    timeToSelect: number, // the time taken from trial start to patch selection in ms.
    keypress: "keyLeft" | "keyRight" | undefined // whether the user pressed the left or right arrow key. Undefined on mouse click / tap.
    clickPosition: [number, number] | undefined, // position of mouse click / tap. Undefined if user pressed left or right arrow key.
    currentCoherency: number, // current coherency percentage of the patch with coherently moving dots
}