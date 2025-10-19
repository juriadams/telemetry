import { describe, expect, test } from "bun:test";
import { sleep } from "bun";
import { Trace } from "@/trace";

describe("Trace", () => {
	test("create and end a new trace with a span", async () => {
		const trace = new Trace();

		expect(trace.id).toBeDefined();
		expect(trace.name).toBeNull();
		expect(trace.attributes).toEqual({});
		expect(trace.startTime).toBeDefined();
		expect(trace.endTime).toBeNull();
		expect(trace.spans).toBeDefined();
		expect(trace.spans).toEqual([]);

		const span = trace.createSpan();

		expect(span.id).toBeDefined();
		expect(span.name).toBeNull();
		expect(span.attributes).toEqual({});
		expect(span.startTime).toBeDefined();
		expect(span.endTime).toBeNull();
		expect(span.trace).toBe(trace);
		expect(span.spans).toEqual([]);

		expect(trace.spans).toEqual([span]);

		const nested = span.createSpan();

		expect(nested.id).toBeDefined();
		expect(nested.name).toBeNull();
		expect(nested.attributes).toEqual({});
		expect(nested.startTime).toBeDefined();
		expect(nested.endTime).toBeNull();
		expect(nested.trace).toBe(trace);
		expect(nested.spans).toEqual([]);

		await sleep(5);

		trace.end();

		expect(trace.endTime).toBeGreaterThan(trace.startTime);
		expect(trace.spans).toEqual([span]);

		expect(span.endTime).toBeGreaterThan(span.startTime);

		expect(trace.serialize()).toEqual({
			id: trace.id,
			name: null,
			attributes: {},
			start: trace.startTime,
			end: trace.endTime as number,
			duration: (trace.endTime as number) - trace.startTime,
			spans: [span.serialize()],
		});

		expect(span.serialize()).toEqual({
			id: span.id,
			name: null,
			attributes: {},
			trace: trace.id,
			start: span.startTime,
			end: span.endTime as number,
			duration: (span.endTime as number) - span.startTime,
			spans: [nested.serialize()],
		});
	});
});
