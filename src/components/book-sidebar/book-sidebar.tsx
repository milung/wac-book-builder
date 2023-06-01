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

  @Prop() version: string;


  @State()
  private content: string = '';
  @State()
  private scrolled: boolean = false; 

  private versionString: string = "0.0";

  async componentWillLoad() {
    this.content = "Načítavam ... ";
    this.content = await fetch(this.tocPath).then(r => r.text());
    /* get version from meta tag */
    let versionTag = document.querySelector("meta[name='version']");
    if (versionTag) {
      this.versionString = versionTag.getAttribute("content");
    }
  }


  render() {
    
    return (
      <Host>
        <div class={"header" + (this.scrolled ? " scrolled" : "")}>

          <md-standard-icon-button
            class="close-button"
            onclick={() => this.menuClosed.emit()}
          >
            <md-icon>menu</md-icon>
          </md-standard-icon-button>
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
                window.location.href = "mailto:"+ atob("bWlsYW4udW5nZXJAc2llbWVucy1oZWFsdGhpbmVlcnMuY29t") + "?subject=Reakcia k skriptám WAC" }
            }>Milan Unger, et al.</div>
            <span>Verzia: {this.versionString}</span>
          </div>
        </div>
      </Host>
    );
  }

}
