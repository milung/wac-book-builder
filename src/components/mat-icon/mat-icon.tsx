import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'mat-icon',
  styleUrl: 'mat-icon.css',
  shadow: true,
})
export class MatIcon {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
