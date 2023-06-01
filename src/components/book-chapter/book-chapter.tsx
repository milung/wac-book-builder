import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import { BookRef } from '../../global/book-ref';

@Component({
  tag: 'book-chapter',
  styleUrl: 'book-chapter.css',
  shadow: true,
})
export class BookChapter {

  @Prop() frontMatter: string = "README"

 

  @State()
  private  content: string = '';

  @State() currentLocationPath: string;

  @Watch('currentLocationPath')
  async currentLocationChanged() {
    this.content = "Načítavam ... ";
    const bookRef = BookRef.fromLocation(this.currentLocationPath);
    this.content = await bookRef.fetchContent();
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
        <div innerHTML={this.content}></div>
        <div class="half-page"></div>
      </Host>
    );
  }

}
