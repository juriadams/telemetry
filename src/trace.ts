import { type SerializedSpan, Span, type SpanOptions } from "@/span";

export interface TraceOptions {
  id?: string;
  name?: string | null | undefined;
  attributes?:
    | Record<string, string | number | boolean | null>
    | null
    | undefined;
}

export interface SerializedTrace {
  id: string;
  name: string | null;
  attributes: Record<string, string | number | boolean | null>;
  start: number;
  end: number;
  duration: number;
  spans: Array<SerializedSpan>;
}

export class Trace {
  public readonly id: string;

  public readonly name: string | null;

  public attributes: Record<string, string | number | boolean | null>;

  public startTime: number;

  public endTime: number | null = null;

  public spans: Array<Span> = [];

  constructor(opts?: TraceOptions) {
    this.id = opts?.id ?? crypto.randomUUID();
    this.name = opts?.name ?? null;
    this.attributes = opts?.attributes ?? {};

    this.startTime = Date.now();
  }

  public end() {
    this.endTime = Date.now();

    for (const span of this.spans) span.end();
  }

  public serialize(): SerializedTrace {
    if (!this.endTime) this.end();

    return {
      id: this.id,
      name: this.name,
      attributes: this.attributes,
      start: this.startTime,
      end: this.endTime as number,
      duration: (this.endTime as number) - this.startTime,
      spans: this.spans.map((span) => span.serialize()),
    };
  }

  public createSpan(opts?: Omit<SpanOptions, "trace">): Span {
    const span = new Span({ ...opts, trace: this });

    this.spans.push(span);

    return span;
  }
}
