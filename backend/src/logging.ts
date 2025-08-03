import { configure, getConsoleSink } from "@logtape/logtape";
import { AsyncLocalStorage } from "node:async_hooks";

await configure({
  contextLocalStorage: new AsyncLocalStorage(),
  sinks: {
    console: getConsoleSink(),
  },
  filters: {},
  loggers: [
    { category: "backend", lowestLevel: "debug", sinks: ["console"] },
    { category: "federation", lowestLevel: "info", sinks: ["console"] },
    { category: "inbox", lowestLevel: "debug", sinks: ["console"] },
    { category: "activity", lowestLevel: "debug", sinks: ["console"] },
    { category: "mongoose", lowestLevel: "debug", sinks: ["console"] },
    { category: ["logtape", "meta"], lowestLevel: "warning", sinks: ["console"] },
    { category: ["fedify", "sig"], lowestLevel: "debug", sinks: ["console"] },
  ],
});