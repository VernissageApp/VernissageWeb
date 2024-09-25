import { Directive, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { WindowService } from "../services/common/window.service";

@Directive({
    selector: '[appHrefToRouterLink]'
  })
  export class HrefToRouterLinkDirective {
    constructor(private router: Router, private windowService: WindowService) {
    }
    
    @HostListener('click', ['$event'])
    onClick(event: Event) {

        const anchorElement = this.findHtmlAnchorElement(event.target);
        if (!anchorElement) {
            return;
        }
  
        const href = anchorElement?.getAttribute('href')?.replace(/(^\s+|\s+$)/gs, '');
        if (!href) {
            return;
        }
  
        // If the url is not from our side we have to stop processing.
        if (!href.startsWith('/') && !href.startsWith(this.windowService.getApplicationBaseUrl())) {
            return;
        }

        // Stop propagation.
        event.preventDefault();
        event.stopPropagation();
  
        // Feed the router.
        this.router.navigateByUrl(href);
    }

    private findHtmlAnchorElement(target: any): HTMLAnchorElement | null {
        if (target instanceof HTMLAnchorElement) {
            return target;
        }

        if (!target.parentNode) {
            return null
        }

        return this.findHtmlAnchorElement(target.parentNode);
    }
}