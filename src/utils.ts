import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | undefined | null): string {
    if (!dateString) return '-';

    // Handle YYYY-MM-DD specifically to avoid timezone issues
    const yyyyMmDdRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (yyyyMmDdRegex.test(dateString)) {
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
    }

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    } catch {
        return dateString;
    }
}
