import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from "@angular/router";

export class CustomReuseStrategy implements RouteReuseStrategy {
    storedRouteHandles = new Map<string, DetachedRouteHandle>();
   
    // Decides if the route should be stored
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return route.data.reuse === true;
    }
   
    //Store the information for the route we're destructing
    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        if (route.routeConfig?.path) {
            this.storedRouteHandles.set(route.routeConfig.path, handle);
        }
    }
   
   //Return true if we have a stored route object for the next route
    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        if (route.routeConfig?.path) {
            return this.storedRouteHandles.has(route.routeConfig.path);
        }

        return false;
    }
   
    //If we returned true in shouldAttach(), now return the actual route data for restoration
    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        if (route.routeConfig?.path) {
            return this.storedRouteHandles.get(route.routeConfig.path) ?? null;
        }

        return false
    }
   
    //Reuse the route if we're going to and from the same route
    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
       return future.routeConfig === curr.routeConfig;
    }
}
