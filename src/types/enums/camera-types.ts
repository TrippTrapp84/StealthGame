export const enum ECameraTypes {
	/**
	 * If you have a really complicated camera state that simply can't be
	 * encompassed by the existing camera code, you can switch to this state and
	 * control the camera yourself.
	 */
	Custom = "Custom",

	/**
	 * The default Roblox camera. This also blocks all effect stack updates, so
	 * BE CAREFUL
	 */
	Default = "Default",
}
