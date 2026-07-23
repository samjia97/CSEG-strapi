export declare function renderLodashStyleTemplate(template: string, values: object): string;
/**
 * Monday 26th January
 * @param date
 */
export declare const formatDate: (date: Date) => string;
/**
 * Monday 26th Jan, 12 pm
 * @param date
 */
export declare const formatSubjectDate: (date: Date) => string;
/**
 * Returns form string if non-empty string. Otherwise returns
 * default value
 * @param value
 * @param defaultValue
 */
export declare const extractFormString: (value: any, defaultValue: string) => string;
/**
 * Extracts and validates a date from form value.
 * Returns null if date is not valid, otherwise returns Date object.
 * @param value - The form value to extract date from
 * @returns Date object if valid, null otherwise
 */
export declare const extractValidDate: (value: any) => Date | null;
/**
 * Combines a date-only value (YYYY-MM-DD) and a time value (HH:MM[:SS]) into a Date in
 * the *local* timezone, so downstream formatting reads back the intended wall-clock start
 * time. Parsing the date alone via `new Date("2026-07-23")` treats it as UTC midnight,
 * which then reads back shifted by the local offset (e.g. "1am" under BST). Returns null
 * if the date is missing/invalid.
 * @param dateValue - date-only form value, e.g. "2026-07-23"
 * @param timeValue - time form value, e.g. "14:30:00.000"
 */
export declare const combineDateAndTime: (dateValue: any, timeValue: any) => Date | null;
export declare function extractlocationFormatted(eventFormat: string, physicalLocation: string, teamsLink: string): string;
