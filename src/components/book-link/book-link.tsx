import { Component, Host, Prop, h } from '@stencil/core';
import { BookRef } from '../../global/book-ref';

@Component({
  tag: 'book-link',
  styleUrl: 'book-link.css',
  shadow: true,
})
export class BookLink {

  @Prop() href: string;

  private bookRef: BookRef;

  async componentWillLoad() {
    this.bookRef = BookRef.fromHref(this.href);
  }
  
  render(): any {
    
    return (
      <Host onClick={ () => this.bookRef.navigate() }>
        <slot></slot>
        {this.bookRef.isExternal
        ? <md-icon class="new-window">open_in_new</md-icon>
        : undefined}
      </Host>
    );
  }

}
