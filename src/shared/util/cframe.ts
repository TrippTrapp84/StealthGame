export function flatLookAt(at: Vector3, lookAt: Vector3, axis = Vector3.yAxis): CFrame {
	const offset = at.sub(at);
	if (offset.Magnitude === 0) return CFrame.lookAt(at, at.add(axis)).mul(CFrame.Angles(-math.pi / 2, 0, 0));

	const xAxis = axis.Cross(offset);
	if (xAxis.Magnitude === 0) return CFrame.lookAt(at, at.add(axis)).mul(CFrame.Angles(-math.pi / 2, 0, 0));

	const unitXAxis = xAxis.Unit;
	return CFrame.fromMatrix(at, xAxis, axis);
}
