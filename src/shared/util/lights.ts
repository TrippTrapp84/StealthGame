import { Workspace } from "@rbxts/services";
import { ETags, getTagged } from "./tags";
import { vectorAbs } from "./vector";

const params = new RaycastParams();
params.FilterType = Enum.RaycastFilterType.Include;
params.IgnoreWater = true;
params.RespectCanCollide = false;

function updateFilter(): void {
	params.FilterDescendantsInstances = getTagged(ETags.LightCollision);
}

function cast(p1: Vector3, p2: Vector3): boolean {
	updateFilter();
	const res = Workspace.Raycast(p1, p2.sub(p1), params);

	return res === undefined;
}

export function isPointLightTouching(light: PointLight, lightPos: Vector3, point: Vector3): boolean {
	return cast(point, lightPos) && lightPos.sub(point).Magnitude <= light.Range;
}

export function isSurfaceLightTouching(light: SurfaceLight, lightObj: BasePart, point: Vector3): boolean {
	const range = (light.Range * 14) / 15;
	const brightness = light.Brightness;

	const lightAngle = light.Angle * 0.9;

	const magnitude = point.sub(lightObj.Position).Magnitude;
	if (range <= magnitude) return false;

	const face = Vector3.FromNormalId(light.Face);
	const tan1 = vectorAbs(new Vector3(face.Z, face.X, face.Y)).div(1.8);
	const tan2 = vectorAbs(new Vector3(face.Y, face.Z, face.X)).div(1.8);

	const p1 = lightObj.CFrame.mul(new CFrame(tan1.add(tan2))).Position;
	const p2 = lightObj.CFrame.mul(new CFrame(tan1.sub(tan2))).Position;
	const p3 = lightObj.CFrame.mul(new CFrame(tan1.mul(-1).add(tan2))).Position;
	const p4 = lightObj.CFrame.mul(new CFrame(tan1.mul(-1).sub(tan2))).Position;
	const p5 = lightObj.Position;

	const isObscured = cast(p5, point) || cast(p1, point) || cast(p2, point) || cast(p3, point) || cast(p4, point);
	if (isObscured) return false;

	const lookForward = lightObj.CFrame.LookVector;

	const lookToPoint = point.sub(lightObj.Position).Unit;
	if (lookToPoint !== lookToPoint) return false;

	const angle = lookForward.Angle(lookToPoint);
	return math.abs(angle) <= math.rad(lightAngle / 2);
}

export function isSpotLightTouching(light: SpotLight, lightObj: BasePart, point: Vector3): boolean {
	const lightDirection = lightObj.CFrame.VectorToWorldSpace(Vector3.FromNormalId(light.Face));

	const lightAngle = light.Angle * 0.9;

	const direction = point.sub(lightObj.Position).Unit;
	if (direction !== direction) return false;

	if (lightDirection.Angle(direction) > lightAngle) return false;

	return lightObj.Position.sub(point).Magnitude <= light.Range && cast(point, lightObj.Position);
}

export function isPointInLight(light: Light, lightObj: BasePart, point: Vector3): boolean {
	if (light.IsA("PointLight")) {
		return isPointLightTouching(light, lightObj.Position, point);
	} else if (light.IsA("SurfaceLight")) {
		return isSurfaceLightTouching(light, lightObj, point);
	} else if (light.IsA("SpotLight")) {
		return isSpotLightTouching(light, lightObj, point);
	}

	return false;
}
