import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import { BookRef } from '../../global/book-ref';

@Component({
  tag: 'book-section',
  styleUrl: 'book-section.css',
  shadow: true,
})
export class BookSection {
  /** Path to this section - section will expand when navigated to this path */
  @Prop() path: string = "";

  @State() currentLocationPath: string;

  @State() expanded: boolean = false;

  @Watch('currentLocationPath')
  async currentLocationChanged() {
        const bookRef = BookRef.fromLocation(this.currentLocationPath);
        this.expanded = bookRef.startsWith(this.path)
  }

  async componentWillLoad() {
    window.navigation.addEventListener("navigate", (ev: Event) => {
      let path = (ev as any).destination.url;
      if (this.currentLocationPath !== path) {
        this.currentLocationPath = path;
      }
  
    });
    this.currentLocationChanged();    
  }

  render() {
    
    return (
      <Host>
        { this.expanded ? <slot></slot> : null}
      </Host>
    );
  }

}
