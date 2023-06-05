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
  @Prop() counter: number = 0;

  @Prop() captionFmt: string = "Figure %d.";

  @State() modal: boolean = false;

  componentWillLoad() {
    /* get counterFmt from meta tag */
    const meta = document.querySelector("meta[name='book-img-counter-fmt']");
    if (meta) {
      this.captionFmt = meta.getAttribute("content");
    }
  }

  render() {
    return (
      <Host >
        <div class={ "wrapper" + ( this.modal ? " modal": "")} onClick={() => this.modal = !this.modal}>
            <img src={this.src} alt={this.alt} />
            <div class="label">
              {this.counter > 0
              ? <span class="counter">{this.captionFmt.replace("%d", this.counter.toString())}</span>
              : undefined
              }
              &nbsp;
              <span class="alt">{this.alt}</span>
            </div>
          </div>
        {this.modal  // keep non modal version for standard layou
        ?  <div class="wrapper">
          <img src={this.src} alt={this.alt} />
          <div class="label">
          {this.counter > 0
              ? <span class="counter">{this.captionFmt.replace("%d", this.counter.toString())}</span>
              : undefined
              }
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
