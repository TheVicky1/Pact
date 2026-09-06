export const DEFAULT_TIMEZONE = "Asia/Kolkata";

function parts(date: Date, timezone: string) {
  const formatted = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(date);
  return Object.fromEntries(formatted.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
}

export function getUserToday(timezone: string, now = new Date()) {
  const value = parts(now, timezone);
  return `${value.year}-${value.month}-${value.day}`;
}

export function getUserTimeOfDay(timezone: string, now = new Date()) {
  const hour = Number(parts(now, timezone).hour);
  if (hour < 5) return "night";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 22) return "evening";
  return "night";
}

export function formatUserDate(timezone: string, now = new Date()) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: timezone, weekday: "long", month: "long", day: "numeric" }).format(now);
}

export function formatDeadline(deadline: string | Date, timezone: string) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: timezone, weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(deadline));
}

export function formatDeadlineInput(deadline: string | Date, timezone: string) {
  const value = parts(new Date(deadline), timezone);
  return `${value.year}-${value.month}-${value.day}T${value.hour}:${value.minute}`;
}

export function isDeadlinePassed(deadline: string | Date, now = new Date()) {
  return new Date(deadline).getTime() < now.getTime();
}

export function getUserDayRange(timezone: string, now = new Date()) {
  const today = getUserToday(timezone, now);
  const start = zonedDateTimeToUtc(`${today}T00:00`, timezone);
  const nextDay = new Date(`${today}T12:00:00Z`);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  return { start, endExclusive: zonedDateTimeToUtc(`${nextDay.toISOString().slice(0, 10)}T00:00`, timezone) };
}

// Converts a wall-clock input in an IANA zone to an instant without assuming server timezone.
export function zonedDateTimeToUtc(localDateTime: string, timezone: string) {
  const [date, time] = localDateTime.split("T");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute, second = 0] = time.split(":").map(Number);
  const desired = Date.UTC(year, month - 1, day, hour, minute, second);
  let instant = desired;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const current = parts(new Date(instant), timezone);
    const observed = Date.UTC(Number(current.year), Number(current.month) - 1, Number(current.day), Number(current.hour), Number(current.minute), Number(current.second));
    instant += desired - observed;
  }
  return new Date(instant).toISOString();
}
