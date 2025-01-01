/* eslint-disable @angular-eslint/directive-selector */
import { ComponentRef, Directive } from "@angular/core";
import { ActivatedRoute, RouterOutlet } from "@angular/router";

export interface OnAttach {
    /**
     * A callback method that is invoked when the RouteReuseStrategy instructs
     * to re-attach a previously detached component / subtree
     */
    onAttach(activatedRoute: ActivatedRoute): void;
}

export interface OnDetach {
    /**
     * A callback method that is invoked when the RouteReuseStrategy instructs
     * to detach component / subtree
     */
    onDetach(): void;
}

@Directive({
    selector: 'app-router-outlet',
    standalone: false
})
export class AppRouterOutletDirective extends RouterOutlet {

    override detach(): ComponentRef<any> {
        const instance: any = this.component;
        if (instance && typeof instance.onDetach === 'function') {
            instance.onDetach();
        }
    
        return super.detach();
    }

    override attach(ref: ComponentRef<any>, activatedRoute: ActivatedRoute): void {
        super.attach(ref, activatedRoute);

        if (ref.instance && typeof ref.instance.onAttach === 'function') {
            ref.instance.onAttach(activatedRoute);
        }
    }
}
