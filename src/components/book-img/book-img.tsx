import { Component, Host, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'book-img',
  styleUrl: 'book-img.css',
  shadow: true,
})
export class BookImg {

  /** 
   * The image source.
   */
  @Prop() src: string;
  /** 
   * The image alt text.
   **/
  @Prop() alt: string;

  /**
   * The one-based index of the image in the current document.
   */
  @Prop() counter: number;

  @Prop() counterFmt: string = "Obrázok %d.";

  @State() modal: boolean = false;

  render() {
    return (
      <Host >
        <div class={ "wrapper" + ( this.modal ? " modal": "")} onClick={() => this.modal = !this.modal}>
            <img src={this.src} alt={this.alt} />
            <div class="label">
              <span class="counter">{this.counterFmt.replace("%d", this.counter.toString())}</span>
              &nbsp;
              <span class="alt">{this.alt}</span>
            </div>
          </div>
        {this.modal  // keep non modal version for standard layou
        ?  <div class="wrapper">
          <img src={this.src} alt={this.alt} />
          <div class="label">
            <span class="counter">{this.counterFmt.replace("%d", this.counter.toString())}</span>
            &nbsp;
            <span class="alt">{this.alt}</span>
          </div>
        </div>
          : undefined

        }
      </Host>
    );
  }

}
