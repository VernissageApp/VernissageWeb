import { CanMatchFn } from '@angular/router';

export const numericStatusIdCanMatch: CanMatchFn = (route, segments) => {
    const statusIdSegmentIndex = route.path?.split('/').indexOf(':id') ?? -1;
    const statusId = segments[statusIdSegmentIndex]?.path ?? '';

    return /^[0-9]+$/.test(statusId);
};
