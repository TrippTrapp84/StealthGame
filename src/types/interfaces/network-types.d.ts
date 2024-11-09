type IServerResponseOk<T> = T extends defined
	? {
			data: T;
			success: true;
	  }
	: {
			data?: T;
			success: true;
	  };

interface IServerResponseBad<E> {
	error: E; // Numbers are error codes, strings are explicit error messages.
	success: false;
}

export type IServerResponse<T = void, E = number | string> = IServerResponseOk<T> | IServerResponseBad<E>;
