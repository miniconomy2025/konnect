import "@js-temporal/polyfill/global";

export function dateToTemporal(date: Date): any {
  // Use globalThis to access the polyfilled Temporal
  return (globalThis as any).Temporal.Instant.fromEpochMilliseconds(date.getTime());
}

export function nowAsTemporal(): any {
  return (globalThis as any).Temporal.Instant.fromEpochMilliseconds(Date.now());
}

export function temporalToDate(temporal: any): Date {
  return new Date(temporal.epochMilliseconds);
}