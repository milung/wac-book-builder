import { Component, Host, Prop, State, h } from '@stencil/core';
import { BookRef } from '../../global/book-ref';

@Component({
  tag: 'book-sidebar-state',
  styleUrl: 'book-sidebar-state.css',
  shadow: true,
})
export class BookSidebarState {

  /** relative link to the page to be loaded */
  @Prop() href: string = "";

  @State() bookRef: BookRef;

  @State() isCurrent: boolean = false;


  render() {
    return (
      <Host>
        <div class={ "state" + (this.isCurrent ? " current" : "")} onClick={(_:Event)=>this.bookRef.navigate()}>
          <span class="icon"><slot name="icon"></slot></span>
          <span><slot></slot></span>
        </div>
      </Host>
    );
  }

  async componentWillLoad() {
    this.bookRef = BookRef.fromHref(this.href);
    
    window.navigation.addEventListener("navigate", (ev: Event) => {
      this.isCurrent = this.bookRef.matchesLocation((ev as any).destination.url);      
    });
    this.isCurrent = this.bookRef.matchesLocation(undefined);
  }

}
