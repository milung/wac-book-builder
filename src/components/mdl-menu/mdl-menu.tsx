import { Component,  Host, h } from '@stencil/core';

@Component({
  tag: 'mdl-menu',
  styleUrl: 'mdl-menu.css',
  shadow: true,
})
export class MdlMenu {

 

  render() {
    return (
      <Host>        
        <slot></slot>
      </Host>
    );
  }

}
