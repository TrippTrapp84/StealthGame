declare type UserId = number;
declare type AssetId = `rbxassetid://${number}`;

declare type Constructor<T extends object = object> = new (...args: unknown[]) => T;
