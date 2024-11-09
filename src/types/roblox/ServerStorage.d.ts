declare interface ServerStorage {
	Assets: Folder & {
		Levels: Folder & {
			GetChildren(): Array<Folder>;
		};

		Models: {
			GetChildren(): Array<Model>;
			FindFirstChild(name: string): Model;

			FlashlightCone: Model;
		} & Folder;
	};
}
