import { Workspace } from "@rbxts/services";
import { vector3XZ } from "./vector";

/**
 * Returns `vec` rotated from camera object to world space, flattened i nthe Y, then unitized.
 */
export function getVecXZRelativeCamera(vec: Vector3): Vector3 {
	const camCF = Workspace.CurrentCamera!.CFrame;

	return vector3XZ(camCF.VectorToWorldSpace(vec)).Unit;
}
