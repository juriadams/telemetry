# `@juriadams/telemetry`

Lightweight and dead-simple library for collecting telemetry data.

## Usage

First, install the package using your dependency manager of choice (`bun`, `npm`, `pnpm`, ...):

```bash
bun add @juriadams/telemetry
```

Then, 

```typescript
import { Hono } from "hono";
import { Trace } from "@juriadams/telemetry";

const app = new Hono();

app.get("/users/:id", async (c) => {
  const trace = new Trace({
    name: "get-user",
    attributes: {
      method: c.req.method,
      path: c.req.path,
      userId: c.req.param("id"),
    },
  });

  const span = trace.createSpan({
    name: "database-lookup",
    attributes: {
      table: "users",
    },
  });

  const user = await db.getUser(c.req.param("id"));

  trace.end();

  // Log or export the Trace.
  console.log(trace.serialize());

  return c.json({
    data: user,
    error: null,
  });
});

export default app;
```

