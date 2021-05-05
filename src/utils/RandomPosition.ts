/**
 * Gets a random position within a rectangular area.
 * @param xMin left bound of area. Float.
 * @param yMin left bound of area. Float.
 * @param xMax left bound of area. Float.
 * @param yMax left bound of area. Float.
 * @returns array with x and y coordinates.
 */
export const getRandomPosition = (xMin: number, yMin: number, xMax: number, yMax: number): [number, number] => {
    let x: number, y: number;
    x = Math.random() * (xMax - xMin) + xMin;
    y = Math.random() * (yMax - yMin) + yMin;
    return [x, y]
}