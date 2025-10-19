import { describe, expect, test } from "bun:test";
import { sleep } from "bun";
import { Trace } from "@/trace";

describe("Trace", () => {
  test("create and end a new trace with a span", async () => {
    const trace = new Trace({
      name: "example-request",
      attributes: {
        method: "GET",
        path: "/auth/session",
      },
    });

    expect(trace.id).toBeDefined();
    expect(trace.name).toBe("example-request");
    expect(trace.attributes).toEqual({
      method: "GET",
      path: "/auth/session",
    });
    expect(trace.startTime).toBeDefined();
    expect(trace.endTime).toBeNull();
    expect(trace.spans).toBeDefined();
    expect(trace.spans).toEqual([]);

    const span = trace.createSpan({
      name: "resolve-session",
    });

    expect(span.id).toBeDefined();
    expect(span.name).toBe("resolve-session");
    expect(span.attributes).toEqual({});
    expect(span.startTime).toBeDefined();
    expect(span.endTime).toBeNull();
    expect(span.trace).toBe(trace);
    expect(span.spans).toEqual([]);

    expect(trace.spans).toEqual([span]);

    const nested = span.createSpan({
      name: "db-lookup",
      attributes: {
        region: "us-east-1",
      },
    });

    expect(nested.id).toBeDefined();
    expect(nested.name).toBe("db-lookup");
    expect(nested.attributes).toEqual({
      region: "us-east-1",
    });
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
      name: "example-request",
      attributes: {
        method: "GET",
        path: "/auth/session",
      },
      start: trace.startTime,
      end: trace.endTime as number,
      duration: (trace.endTime as number) - trace.startTime,
      spans: [span.serialize()],
    });

    expect(span.serialize()).toEqual({
      id: span.id,
      name: "resolve-session",
      attributes: {},
      trace: trace.id,
      start: span.startTime,
      end: span.endTime as number,
      duration: (span.endTime as number) - span.startTime,
      spans: [nested.serialize()],
    });

    expect(nested.serialize()).toEqual({
      id: nested.id,
      name: "db-lookup",
      attributes: {
        region: "us-east-1",
      },
      trace: trace.id,
      start: nested.startTime,
      end: nested.endTime as number,
      duration: (nested.endTime as number) - nested.startTime,
      spans: [],
    });
  });
});
