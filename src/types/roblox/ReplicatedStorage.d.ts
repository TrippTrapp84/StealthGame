interface ReplicatedStorage {
	Assets: {
		GetChildren(): Array<Model>;
		FindFirstChild(name: string): Model | undefined;
	} & Folder;
}
