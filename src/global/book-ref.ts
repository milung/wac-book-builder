
export class BookRef {
    static baseUri = document.baseURI || "/";
    static bookBase = "book/";

    static version = "1.0.0";

    public isExternal = false;
    private constructor(private location: string) { 
        this.isExternal  = location.match(/^[a-zA-Z]+:\/\//) !== null;
    }

    public static fromLocation(location?: string) {

        if (!location) {
            location = window.location.pathname;
        }
        if (location.startsWith("http://") || location.startsWith("https://")) {
            const url = new URL(location);
            location = url.pathname;
        }
        if (BookRef.baseUri.startsWith("http://") || BookRef.baseUri.startsWith("https://")) {
            const url = new URL(this.baseUri);
            BookRef.baseUri = url.pathname;
        }
        if (location.startsWith(BookRef.baseUri)) {
            location = location.substring(BookRef.baseUri.length) || "README";
        }
        return new BookRef(location);
    }

    public static fromHref(href: string) {
        if( href.startsWith("http://") || href.startsWith("https://")) {
            return new BookRef(href);
        }

        if( href.startsWith(BookRef.bookBase)) {
            href = href.substring(BookRef.bookBase.length);
        }
        href = href.split(/\.html/)[0];
        return new BookRef(href);
    }

    public navigate() {
        if(!this.isExternal) {
                window.history.pushState(this, "", BookRef.baseUri + this.location);
        } else {
            window.open(this.location, "_blank");
        }
    }

    public matchesLocation(location: string) {
        const loc = BookRef.fromLocation(location);
        return this.location === loc.location; 
    }

    public startsWith(path: string): boolean {
        return this.location.startsWith(path);
    }

    public async fetchContent(): Promise<string> {
        return fetch(BookRef.baseUri + BookRef.bookBase + this.location + ".html?v=" + BookRef.version).then(r => r.text());
    }

    public async fetchSidebar(): Promise<string> {
        const fragments = (this.location + "a").split("/")
        const toCache: string[] = [];
        let response: Response;
        while (fragments.length >= 0) {
            fragments.pop();
            const path = fragments.join("/");

            let cachedPath = localStorage.getItem(`sidebarPath@${path}`);
            if(!cachedPath) {
                toCache.push(path);
                cachedPath = path;
            }
            if(cachedPath) {
                cachedPath += "/";
            }
            const sidebarPath = BookRef.baseUri + BookRef.bookBase + cachedPath + "_sidebar.html?v=" + BookRef.version;
            try {

                response = await fetch(sidebarPath);
                if (response.status > 199 && response.status < 300) {
                    break;
                }
            }
            catch (e) {
                console.log(e);
            }
        }
        // step up the path and try again

        if (response) {
            toCache.forEach( p => localStorage.setItem(`sidebarPath@${p}`, fragments.join("/")));
            return await response.text();
        } else {
            return "No navigation found";
        }
    }
}