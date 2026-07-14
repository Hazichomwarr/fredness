export const STORE_TIME_ZONE = "America/New_York";

export type StoreDateParts = {
  year: number;
  month: number;
  day: number;
};

export function parseIsoDate(value: string): StoreDateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function timeZoneOffset(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const getPart = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);
  const localAsUtc = Date.UTC(
    getPart("year"),
    getPart("month") - 1,
    getPart("day"),
    getPart("hour"),
    getPart("minute"),
    getPart("second"),
  );

  return localAsUtc - date.getTime();
}

export function storeLocalMidnightToUtc({
  year,
  month,
  day,
}: StoreDateParts) {
  const localAsUtc = Date.UTC(year, month - 1, day, 0, 0, 0);
  const offset = timeZoneOffset(new Date(localAsUtc));

  return new Date(localAsUtc - offset);
}

export function dayAfter(parts: StoreDateParts): StoreDateParts {
  const next = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + 1));

  return {
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  };
}
