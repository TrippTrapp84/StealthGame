export namespace EasingFunctions {
	export namespace In {
		export function linear(from: number, to: number, t: number, length = 1): number {
			const percent = t / length;
			return from * (1 - percent) + to * percent;
		}

		export function quad(from: number, to: number, t: number, length = 1): number {
			const percent = (t / length) ** 2;
			return from * (1 - percent) + to * percent;
		}

		export function cubic(from: number, to: number, t: number, length = 1): number {
			const percent = (t / length) ** 3;
			return from * (1 - percent) + to * percent;
		}

		export function quart(from: number, to: number, t: number, length = 1): number {
			const percent = (t / length) ** 4;
			return from * (1 - percent) + to * percent;
		}

		export function quint(from: number, to: number, t: number, length = 1): number {
			const percent = (t / length) ** 5;
			return from * (1 - percent) + to * percent;
		}

		export function sine(from: number, to: number, t: number, length = 1): number {
			const percent = math.sin(((t / length) * math.pi) / 2);
			return from * (1 - percent) + to * percent;
		}
	}

	export namespace Out {
		export function linear(from: number, to: number, t: number, length = 1): number {
			const percent = t / length;
			return from * (1 - percent) + to * percent;
		}

		export function quad(from: number, to: number, t: number, length = 1): number {
			const percent = (1 - (1 - t / length)) ** 2;
			return from * (1 - percent) + to * percent;
		}

		export function cubic(from: number, to: number, t: number, length = 1): number {
			const percent = (1 - (1 - t / length)) ** 3;
			return from * (1 - percent) + to * percent;
		}

		export function quart(from: number, to: number, t: number, length = 1): number {
			const percent = (1 - (1 - t / length)) ** 4;
			return from * (1 - percent) + to * percent;
		}

		export function quint(from: number, to: number, t: number, length = 1): number {
			const percent = (1 - (1 - t / length)) ** 5;
			return from * (1 - percent) + to * percent;
		}

		export function sine(from: number, to: number, t: number, length = 1): number {
			const percent = math.sin(((1 - (1 - t / length)) * math.pi) / 2);
			return from * (1 - percent) + to * percent;
		}
	}

	export namespace InOut {
		export function linear(from: number, to: number, t: number, length = 1): number {
			const percent = t / length;
			return from * (1 - percent) + to * percent;
		}

		export function quad(from: number, to: number, t: number, length = 1): number {
			if (t > 0.5) {
				return Out.quad(from, to, t, length);
			}

			return In.quad(from, to, t, length);
		}

		export function cubic(from: number, to: number, t: number, length = 1): number {
			if (t > 0.5) {
				return Out.cubic(from, to, t, length);
			}

			return In.cubic(from, to, t, length);
		}

		export function quart(from: number, to: number, t: number, length = 1): number {
			if (t > 0.5) {
				return Out.quart(from, to, t, length);
			}

			return In.quart(from, to, t, length);
		}

		export function quint(from: number, to: number, t: number, length = 1): number {
			if (t > 0.5) {
				return Out.quint(from, to, t, length);
			}

			return In.quint(from, to, t, length);
		}

		export function sine(from: number, to: number, t: number, length = 1): number {
			if (t > 0.5) {
				return Out.sine(from, to, t, length);
			}

			return In.sine(from, to, t, length);
		}
	}
}
