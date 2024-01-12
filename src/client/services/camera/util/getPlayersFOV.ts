/**
 * Calculates the Field Of View relative to the Z axis.
 *
 * @param x X axis.
 * @param y Y axis.
 * @param z Z axis.
 * @param offset an Offset for the Camera's FOV.
 */
export const getCameraFOV = (x: number, _y: number, z: number, offset = 15): number => {
	return math.acos((z ** 2 + x ** 2 - x ** 2) / (2 * x * z)) * offset;
};
