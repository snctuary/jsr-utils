/** A Server-Stream-Event object */
export interface ServerStreamEvent {
	/** The event type */
	type: string;
	/** The event data */
	data: string;
}

/** An event streamer  */
export interface EventStreamer {
	/** Fire a new event */
	postEvent(event: ServerStreamEvent): void;
}

type CloseFn = () => void;

/** Event stream handler */
export type StreamFn = (streamer: EventStreamer) => CloseFn;

/**
 * Create a server-sent-events stream
 *
 * @param fn A stream function
 * @returns A response object
 *
 * @example
 * ```ts
 * Deno.serve(() =>
    streamServerSent((streamer) => {
        let sequences = 0;
        const interval = setInterval(
            () =>
                streamer.postEvent({
                    type: "ping",
                    data: String(sequences++),
                }),
            2_000,
        );

        return () => clearInterval(interval);
    })
 );
 * ```
 */
export function streamServerSent(fn: StreamFn): Response {
	const encoder = new TextEncoder();
	let closeFn: CloseFn;

	const body = new ReadableStream({
		start(cont) {
			function postEvent(event: ServerStreamEvent) {
				cont.enqueue(
					encoder.encode(
						`event: ${event.type}\ndata: ${event.data}\n\n`,
					),
				);
			}
			closeFn = fn({ postEvent });
		},
		cancel() {
			if (closeFn) {
				closeFn();
			}
		},
	});

	return new Response(body, {
		headers: {
			"content-type": "text/event-stream",
		},
	});
}
