export function getConfiguration<T extends Record<string, unknown>>(object: Instance): Partial<T> {
	const configObj = object.FindFirstChildWhichIsA("Configuration");
	if (configObj === undefined) return {};

	const config: Record<string, unknown> = {};

	for (const child of configObj.GetChildren()) {
		if (!child.IsA("ValueBase")) continue;

		config[child.Name] = child.Value;
	}

	return config as Partial<T>;
}
