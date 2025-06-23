import { streamServerSent } from "./server_sent_events.ts";

Deno.serve(() =>
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
