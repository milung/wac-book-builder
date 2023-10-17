import { Component, EventEmitter, Event, Host, State, h, Prop, } from '@stencil/core';

@Component({
  tag: 'book-sidebar',
  styleUrl: 'book-sidebar.css',
  shadow: true,
})
export class BookSidebar {

  /** Rised when the menu buttom is clicked indicating the user want to close menu sidebar */
  @Event() menuClosed: EventEmitter;

  /** Default path to load table of content */
  @Prop() tocPath: string = "./book/_toc.html";



  @State()
  private content: string = '';
  @State()
  private scrolled: boolean = false; 

  private version: string = "latest";
  private author: string = "unknown";
  private email: string = "";
  private description: string = "";

  async componentWillLoad() {
    this.content = "Načítavam ... ";   
    
    const metaNames = ['version', 'author', 'description', 'email'];

    for (const name of metaNames) {
      const tag = document.querySelector(`meta[name='${name}']`);
      if (tag) {
        this[name] = tag.getAttribute('content');
      }
    }

    if (this.email) {
      try {
        this.email = atob(this.email);
      } catch (e) {
        console.log("Error decoding email: " + e);
        this.email = "";
      }
    }

    this.tocPath +=  (this.tocPath.includes("?") ? "&" : "?") + `rev=${this.version}` 
    this.content = await fetch(this.tocPath).then(r => r.text());
  }


  render() {
    
    return (
      <Host>
        <div class={"header" + (this.scrolled ? " scrolled" : "")}>

          <md-icon-button
            class="close-button"
            onclick={() => this.menuClosed.emit()}
          >
            <md-icon>menu</md-icon>
          </md-icon-button>
          <div class="title">Obsah</div>
        </div>


        <div class="content" innerHTML={this.content}
          onScroll={(ev: Event) => { this.scrolled = (ev.target as HTMLElement).scrollTop > 8 }}>
        </div>
        <div class="footer">
          <div class="version">
            <span class="cc-by"><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank"><img src="./assets/icon/by.svg"></img></a></span>
            <div class="author" onClick={
              () => { 
                window.location.href = `mailto:${this.email}?subject=${this.description}, (${this.version})` }
            }>{this.author}</div>
            <span>Verzia: {this.version}</span>
          </div>
        </div>
      </Host>
    );
  }

}
