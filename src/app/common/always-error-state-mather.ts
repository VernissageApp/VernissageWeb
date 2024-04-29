import { ErrorStateMatcher } from "@angular/material/core";

export class AlwaysErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(): boolean {
        return true;
    }
}
