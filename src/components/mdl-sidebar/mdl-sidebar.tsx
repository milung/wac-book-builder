import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'mdl-sidebar',
  styleUrl: 'mdl-sidebar.css',
  shadow: true,
})
export class MdlSidebar {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
