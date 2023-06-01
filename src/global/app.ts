
import "@material/web/elevation/elevation.js";
import "@material/web/fab/fab.js";
import "@material/web/icon/icon.js";
import "@material/web/iconbutton/standard-icon-button.js";
import "@material/web/iconbutton/filled-tonal-icon-button.js";
import "@material/web/iconbutton/outlined-icon-button.js";
import "@material/web/list/list.js";
import "@material/web/list/list-item.js";
import "@material/web/divider/divider.js";
/**
/**
 * The code to be executed should be placed within a default function that is
 * exported by the global script. Ensure all of the code in the global script
 * is wrapped in the function() that is exported.
 */

declare global {
    interface Window { navigation: any; }
}

class PolyNavigationDestination {
    constructor(url: string) {
        this.url = url;

    }
    url: string;
}

class PolyNavigateEvent extends Event {
    constructor(destination: string | URL) {
        super('navigate', { bubbles: true, cancelable: true });
        
        let rebased  = new URL(destination,  document.baseURI)
        this.canIntercept = location.protocol === rebased.protocol
         && location.host === rebased.host && location.port === rebased.port;
         this.destination = new PolyNavigationDestination(rebased.href);
    }

    destination: PolyNavigationDestination;
    canIntercept: boolean = true;
}

export default async () => {
    if (!window.navigation) {
        // simplified version of navigation api
        window.navigation = new EventTarget();

        window.history.pushState = (f => function pushState() {
            var ret = f.apply(this, arguments);
            let url = arguments[2];
            window.navigation.dispatchEvent(new PolyNavigateEvent(url));
            return ret;
        })(window.history.pushState);

        window.addEventListener("popstate", () => {
            window.navigation.dispatchEvent(new PolyNavigateEvent(document.location.href));
        });

        let previousUrl = '';
        const observer = new MutationObserver(function () {
            if (location.href !== previousUrl) {
                previousUrl = location.href;
                window.navigation.dispatchEvent(new PolyNavigateEvent(location.href));
            }
        });

        const config = { subtree: true, childList: true };
        observer.observe(document, config);
        window.onunload = () => {
            observer.disconnect();
        }
    }

}; 
