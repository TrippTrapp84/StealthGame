export const getZoomOffset = (camera: Camera, size: Vector2, percentOfScreen: Vector2): number => {
	const viewportSize = camera.ViewportSize;
	const aspectRatio = viewportSize.X / viewportSize.Y;
	const heightFactor = math.tan(math.rad(camera.FieldOfView) / 2);
	const widthFactor = heightFactor * aspectRatio;

	const depth = (0.5 * size.X) / (percentOfScreen.X * widthFactor);
	const depthTwo = (0.5 * size.Y) / (percentOfScreen.Y * heightFactor);

	return math.max(depth, depthTwo);
};
