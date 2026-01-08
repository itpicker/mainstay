/**
 * Standardizes date formatting across the application to prevent hydration errors.
 * Returns date in 'YYYY. MM. DD.' format.
 * 
 * @param date - Date string or object
 * @returns Formatted date string or '-' if invalid
 */
export function formatDate(date: string | Date | undefined | null): string {
    if (!date) return '-';

    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        return `${year}. ${month}. ${day}.`;
    } catch (e) {
        return '-';
    }
}
