import type { Trace } from "@/trace";

export interface SpanOptions {
	id?: string;
	name?: string | null | undefined;
	attributes?:
		| Record<string, string | number | boolean | null>
		| null
		| undefined;
	trace: Trace;
}

export interface SerializedSpan {
	id: string;
	name: string | null;
	attributes: Record<string, string | number | boolean | null>;
	trace: string;
	start: number;
	end: number;
	duration: number;
	spans: Array<SerializedSpan>;
}

export class Span {
	public readonly id: string;

	public readonly name: string | null;

	public attributes: Record<string, string | number | boolean | null>;

	public readonly trace: Trace;

	public startTime: number;

	public endTime: number | null = null;

	public spans: Array<Span> = [];

	constructor(opts: SpanOptions) {
		this.id = opts?.id ?? crypto.randomUUID();
		this.name = opts.name ?? null;
		this.attributes = opts.attributes ?? {};
		this.trace = opts.trace;
		this.startTime = Date.now();
	}

	public end() {
		this.endTime = Date.now();

		for (const span of this.spans) span.end();
	}

	public serialize(): SerializedSpan {
		if (!this.endTime) this.end();

		return {
			id: this.id,
			name: this.name,
			attributes: this.attributes,
			trace: this.trace.id,
			start: this.startTime,
			end: this.endTime as number,
			duration: (this.endTime as number) - this.startTime,
			spans: this.spans.map((span) => span.serialize()),
		};
	}

	public createSpan(opts?: Omit<SpanOptions, "trace">): Span {
		const span = new Span({ ...opts, trace: this.trace });

		this.spans.push(span);

		return span;
	}
}
