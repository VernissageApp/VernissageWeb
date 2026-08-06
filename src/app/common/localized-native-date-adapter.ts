import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

type DatePart = 'day' | 'month' | 'year';

@Injectable()
export class LocalizedNativeDateAdapter extends NativeDateAdapter {
    override parse(value: unknown, parseFormat: unknown): Date | null {
        if (typeof value !== 'string') {
            return super.parse(value, parseFormat);
        }

        const input = value.trim();
        if (!input) {
            return null;
        }

        const isoDateParts = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (isoDateParts) {
            return this.createValidDate(isoDateParts[1], isoDateParts[2], isoDateParts[3]);
        }

        const localizedDateParts = input.match(/^(\d{1,4})\s*[./-]\s*(\d{1,2})\s*[./-]\s*(\d{1,4})$/);
        if (!localizedDateParts) {
            return super.parse(value, parseFormat);
        }

        const datePartOrder = new Intl.DateTimeFormat(this.locale, {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        }).formatToParts(new Date(Date.UTC(2001, 10, 22, 12)))
            .map(part => part.type)
            .filter((part): part is DatePart => part === 'day' || part === 'month' || part === 'year');

        if (datePartOrder.length !== 3) {
            return this.invalid();
        }

        const inputParts = localizedDateParts.slice(1);
        const parsedParts = Object.fromEntries(
            datePartOrder.map((part, index) => [part, inputParts[index]])
        ) as Record<DatePart, string>;

        return this.createValidDate(parsedParts.year, parsedParts.month, parsedParts.day);
    }

    private createValidDate(yearValue: string, monthValue: string, dayValue: string): Date {
        if (!/^\d{4}$/.test(yearValue)) {
            return this.invalid();
        }

        const year = Number(yearValue);
        const month = Number(monthValue);
        const day = Number(dayValue);

        if (month < 1 || month > 12 || day < 1 || day > 31) {
            return this.invalid();
        }

        try {
            const date = this.createDate(year, month - 1, day);
            return this.getYear(date) === year && this.getMonth(date) === month - 1 && this.getDate(date) === day
                ? date
                : this.invalid();
        } catch {
            return this.invalid();
        }
    }
}
