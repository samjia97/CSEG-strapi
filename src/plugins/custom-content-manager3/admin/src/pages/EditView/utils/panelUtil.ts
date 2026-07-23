export function renderLodashStyleTemplate(template: string, values: object) {
  return template.replace(
    /<%=\s*([\w.]+)\s*%>/g,
    (_, keyPath) => {
      return keyPath
      .split('.')
      .reduce((acc, key) => acc?.[key], values) ?? '';
    }
  );
}

const getOrdinal = (d: number) => {
  if (d > 3 && d < 21) return 'th';
  switch (d % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};
/**
 * Monday 26th January
 * @param date
 */
export const formatDate = (date: Date) => {
  const dayName = date.toLocaleDateString('en-US', {weekday: 'long'}); // Monday
  const monthName = date.toLocaleDateString('en-US', {month: 'long'}); // January
  const dayNumber = date.getDate(); // 26
  const suffix = getOrdinal(dayNumber); // th

  return `${dayName} ${dayNumber}${suffix} ${monthName}`;
};
/**
 * Monday 26th Jan, 12 pm
 * @param date
 */
export const formatSubjectDate = (date: Date) => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];

  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const ampm = hours24 >= 12 ? "pm" : "am";

  const suffix = getOrdinal(day);

  return `${dayName} ${day}${suffix} ${month}, ${hours12}${ampm}`;

}
/**
 * Returns form string if non-empty string. Otherwise returns
 * default value
 * @param value
 * @param defaultValue
 */
export const extractFormString = (value: any, defaultValue: string) => {
  return typeof value === 'string' && value.trim() != '' ? value.trim() : defaultValue
}
/**
 * Extracts and validates a date from form value.
 * Returns null if date is not valid, otherwise returns Date object.
 * @param value - The form value to extract date from
 * @returns Date object if valid, null otherwise
 */
export const extractValidDate = (value: any): Date | null => {
  const dateStr = extractFormString(value, '');
  if (!dateStr) {
    return null;
  }
  const parsedDate = new Date(dateStr);
  return !isNaN(parsedDate.getTime()) ? parsedDate : null;
}

/**
 * Combines a date-only value (YYYY-MM-DD) and a time value (HH:MM[:SS]) into a Date in
 * the *local* timezone, so downstream formatting reads back the intended wall-clock start
 * time. Parsing the date alone via `new Date("2026-07-23")` treats it as UTC midnight,
 * which then reads back shifted by the local offset (e.g. "1am" under BST). Returns null
 * if the date is missing/invalid.
 * @param dateValue - date-only form value, e.g. "2026-07-23"
 * @param timeValue - time form value, e.g. "14:30:00.000"
 */
export const combineDateAndTime = (dateValue: any, timeValue: any): Date | null => {
  const dateStr = extractFormString(dateValue, '');
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('T')[0].split('-').map(Number);
  if (!y || !m || !d) return null;
  const [hRaw, mRaw] = extractFormString(timeValue, '').split(':');
  const hours = Number(hRaw) || 0;
  const minutes = Number(mRaw) || 0;
  const combined = new Date(y, m - 1, d, hours, minutes, 0, 0); // local time
  return isNaN(combined.getTime()) ? null : combined;
};

export function extractlocationFormatted(eventFormat: string, physicalLocation: string, teamsLink: string) {
  let locationFormatted = '[Please enter location and microsoft teams link here]';
  if (eventFormat.toLowerCase().includes('hybrid')) {
    locationFormatted = `hybrid - both in person in ${physicalLocation}, and online on MS Teams at ${teamsLink}`;
  } else if (eventFormat.toLowerCase().includes('online')) {
    locationFormatted = `online on MS Teams at ${teamsLink}`;
  } else if (eventFormat.toLowerCase().includes('person')) {
    locationFormatted = `in person in ${physicalLocation}`;
  }
  return locationFormatted;
}
