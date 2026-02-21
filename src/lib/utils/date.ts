export function toJsDate(value: any): Date {
  if (!value) return new Date();
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);
  return value instanceof Date ? value : new Date(value);
}
