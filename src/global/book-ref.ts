
export class BookRef {
    static baseUri = document.baseURI || "/";
    static bookBase = "book/";

    private static  _version: string;
    static get version(){
        //from meta tag 
        if(!BookRef._version) {
            const meta = document.querySelector("meta[name='version']");
            if(meta) {
                BookRef._version = meta.getAttribute("content");
            }
        }
        return BookRef._version;
    };

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
        return fetch(BookRef.baseUri + BookRef.bookBase + this.location + ".html?rev=" + BookRef.version).then(r => r.text());
    }
}