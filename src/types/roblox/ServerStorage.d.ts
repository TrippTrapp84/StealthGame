declare interface ServerStorage {
	Assets: Folder & {
		Levels: Folder & {
			GetChildren(): Array<Folder>;
		};
	};
}
