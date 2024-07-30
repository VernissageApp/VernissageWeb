// Import angular service worker.
importScripts("./ngsw-worker.js");

// Create custom service worker logic.
(() => {
    var VernissageServiceWorker = class {
        constructor( scope2 ) {
            this.scope = scope2;
            this.scope.addEventListener("push", (event) => this.myOnPush(event));
        }

        myOnPush(event) {
            if (!event.data) {
                return;
            }
            event.waitUntil( this.setBadgeCount(event.data.json()) );
        }

        async setBadgeCount( data ) {
            const badgeCount = data.notification?.data?.badgeCount;
            if (navigator.setAppBadge) {
                if (badgeCount && badgeCount > 0) {
                    await navigator.setAppBadge(badgeCount);
                } else {
                    await navigator.clearAppBadge();
                }
            } else {
                console.error("Badging not supported on this platform.");
            }
        }
    }

    var scope = self;
    new VernissageServiceWorker( scope );
})();