import { Injectable } from '@angular/core';
import { User } from 'src/app/models/user';

@Injectable({
    providedIn: 'root'
})
export class UserDisplayService {

    displayName(user: User | undefined): string {
        if(!user) {
            return '';
        }

        if (user.name && user.name.trim().length > 0) {
            return user.name;
        }

        if (user.userName) {
            return `@${user.userName}`;
        }

        return '';
    }

    verifiedUrl(user: User | undefined): string | undefined {
        if(!user || !user.fields || user.fields.length === 0) {
            return undefined;
        }

        for(const field of user.fields) {
            if (field.isVerified) {
                return field.valueHtml;
            }
        }

        return undefined;
    }
}