import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'book-hint-type',
  styleUrl: 'book-hint-type.css',
  shadow: true,
})
export class BookHintType {

  render() {
    return (
      <Host>
        <slot name="icon"></slot>
      </Host>
    );
  }

}
