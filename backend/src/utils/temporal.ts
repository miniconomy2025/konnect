import { Temporal } from "@js-temporal/polyfill";

export function dateToTemporal(date: Date): Temporal.Instant {
  return Temporal.Instant.fromEpochMilliseconds(date.getTime());
}

export function nowAsTemporal(): Temporal.Instant {
  return Temporal.Instant.fromEpochMilliseconds(Date.now());
}

export function temporalToDate(temporal: Temporal.Instant): Date {
  return new Date(temporal.epochMilliseconds);
}