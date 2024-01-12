export function lineIntersection(startA: Vector3, endA: Vector3, startB: Vector3, endB: Vector3): Vector3 {
	const point_1_x1 = startA.X;
	const point_1_y1 = startA.Z;
	const point_1_x2 = endA.X;
	const point_1_y2 = endA.Z;
	const point_2_x1 = startB.X;
	const point_2_y1 = startB.Z;
	const point_2_x2 = endB.X;
	const point_2_y2 = endB.Z;
	// m = (y1 - y2) / (x1 - x2)
	let line_1_m = 0;
	let line_2_m = 0;
	// b = -(mx1) + y1
	let line_1_b = 0;
	let line_2_b = 0;
	let intersect_x = 0;
	let intersect_z = 0;
	const isLineOneVertical = (point_1_x1 / point_1_x2) % 2 === 1;
	const isLineTwoVertical = (point_2_x1 / point_2_x2) % 2 === 1;
	if (isLineOneVertical && isLineTwoVertical) {
		error(error("There is no cross point"));
	}
	// Line 1
	if (isLineOneVertical) {
		line_2_m = (point_2_y1 - point_2_y2) / (point_2_x1 - point_2_x2);
		line_2_b = -(line_2_m * point_2_x1) + point_2_y1;
		intersect_x = point_1_x1;
		intersect_z = line_2_m * intersect_x + line_2_b;
		// Line 2
	} else if (isLineTwoVertical) {
		line_1_m = (point_1_y1 - point_1_y2) / (point_1_x1 - point_1_x2);
		line_1_b = -(line_1_m * point_1_x1) + point_1_y1;
		intersect_x = point_2_x1;
		intersect_z = line_1_m * intersect_x + line_1_b;
	} else {
		line_1_m = (point_1_y1 - point_1_y2) / (point_1_x1 - point_1_x2);
		line_2_m = (point_2_y1 - point_2_y2) / (point_2_x1 - point_2_x2);

		if (line_1_m === line_2_m) {
			error(error("There is no cross point"));
		}
		line_1_b = -(line_1_m * point_1_x1) + point_1_y1;
		line_2_b = -(line_2_m * point_2_x1) + point_2_y1;
		intersect_x = (line_2_b - line_1_b) / (line_1_m - line_2_m);
		intersect_z = line_1_m * intersect_x + line_1_b;
	}

	return new Vector3(intersect_x, point_1_y1, intersect_z);
}
