/** All types comparable with `<`,`>`,`=` */
declare type Comparable = number | string;
declare type Nominal = number | string | bigint | boolean;

declare type UserId = number;
declare type AnimationId = number;
declare type AssetId = `rbxassetid://${number}`;

declare type Constructor<T extends object = object> = new (...args: unknown[]) => T;

declare type ToString<T extends Nominal> = `${T}`;
declare function tostring<T>(value: T): T extends Nominal ? ToString<T> : string;
declare function tonumber(value: ToString<number>, base?: number): number;

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

declare interface Range {
	end: number;
	start: number;
}

declare type PartialRecord<K extends string | number | symbol, V> = Partial<Record<K, V>>;

/** Graceful failure return type */
declare type Result<T, E = void> = [success: true, data: T] | [success: false, error: E];

declare type ValueOf<T> = T[keyof T];

type ImmutablePrimitive = undefined | boolean | string | number;

type Immutable<T> = T extends ImmutablePrimitive
	? T
	: T extends Array<infer U>
	  ? ImmutableArray<U>
	  : T extends Map<infer K, infer V>
	    ? ImmutableMap<K, V>
	    : T extends Set<infer M>
	      ? ImmutableSet<M>
	      : ImmutableObject<T>;

type ImmutableArray<T> = ReadonlyArray<Immutable<T>>;
type ImmutableMap<K, V> = ReadonlyMap<Immutable<K>, Immutable<V>>;
type ImmutableSet<T> = ReadonlySet<Immutable<T>>;
type ImmutableObject<T> = { readonly [K in keyof T]: Immutable<T[K]> };

type SignalCallback<S extends RBXScriptSignal> = S extends RBXScriptSignal<infer T> ? T : never;
