export enum ECameraEffects {
	/**
	 * @hidden
	 * This effect is reserved for internal camera logic only. It will always be
	 * applied first, and there should never be more than 1 core effect at any
	 * given time.
	 */
	Core = 0,

	Shake,
}
