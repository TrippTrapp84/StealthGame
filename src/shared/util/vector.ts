export function vector3XY(vec: Vector3): Vector3 {
	return new Vector3(vec.X, vec.Y, 0);
}

export function vector3XZ(vec: Vector3): Vector3 {
	return new Vector3(vec.X, 0, vec.Z);
}

export function vector3YZ(vec: Vector3): Vector3 {
	return new Vector3(0, vec.Y, vec.Z);
}

export function vector3PositiveY(vec: Vector3): Vector3 {
	return new Vector3(vec.X, math.max(vec.Y, 0), vec.Z);
}

export function vectorAbs(vec: Vector3): Vector3 {
	return new Vector3(math.abs(vec.X), math.abs(vec.Y), math.abs(vec.Z));
}
