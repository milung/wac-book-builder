import { Component, Host, Listen, State, h } from '@stencil/core';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: true,
})
export class AppRoot {

  @State() menuOpen: boolean = true;

  @Listen('menuClosed')
  menuClosedHandler() {
    this.openMenu(false);
  }

  @State() theme: string = 'light';
  @State() scrolled: boolean = false;


  render() {
    return (
      <Host >
        <page class={this.menuOpen ? "menu-open" : "menu-closed"}>
          <topbar class={ this.scrolled ? "scrolled" : ""}>
            <md-standard-icon-button class="menu-button"
              onclick={() => this.openMenu(true)}>
              <md-icon>menu</md-icon>
            </md-standard-icon-button>
            <h1 slot="title">Vývoj webových aplikácií</h1>
            <div topbar-tools>
              
              <md-standard-icon-button onclick={() => this.changeFontSize(-1)}>
                <md-icon>text_decrease</md-icon>
              </md-standard-icon-button>
              <md-standard-icon-button onclick={() => this.changeFontSize(+1)}>
                <md-icon>text_increase</md-icon>
              </md-standard-icon-button>
              <md-standard-icon-button onclick={() => this.toggleTheme()}>
                <md-icon>{this.theme === "light" ? "dark_mode" : "light_mode"}</md-icon>
              </md-standard-icon-button>
            </div>
          </topbar>
          <mdl-menu class="menu" onClick={() => {
            /** close only if navigation drawer is in modal form */
            const mediaQuery = window.matchMedia('(max-width: 60rem)');
            if (mediaQuery.matches) {
              this.openMenu(false);
            }
          }}>
            <book-sidebar ></book-sidebar>
          </mdl-menu>
          <main>
            <book-chapter
              onScroll={(ev: Event) => {
                this.scrolled = (ev.target as HTMLElement).scrollTop > 8;
              }
              }
            ></book-chapter>
          </main>
        </page>
      </Host>
    );
  }

  componentWillLoad() {
    this.initTheme();
  }

  private setTheme(themeName: string) {
    localStorage.setItem('theme', themeName);
    this.theme = themeName;
    document.documentElement.className = 'theme-' + themeName;
  }
  // function to toggle between light and dark theme
  private toggleTheme() {
    if (localStorage.getItem('theme') === 'dark') {
      this.setTheme('light');
    } else {
      this.setTheme('dark');
    }
  }

  private openMenu(open: boolean) {
    this.menuOpen = open;
    localStorage.setItem('menuOpen', this.menuOpen ? 'true' : 'false');
  }

  private changeFontSize(delta: number) {
    const html = document.querySelector('html');
    const fontSize = parseInt(window.getComputedStyle(html).fontSize);
    html.style.fontSize = fontSize + fontSize*0.2*delta + 'px';
    localStorage.setItem('fontSize', html.style.fontSize);
  }

  // Immediately invoked function to set the theme on initial load
  private initTheme() {
    if (localStorage.getItem('theme') === 'dark') {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }
    const fontSize = localStorage.getItem('fontSize');
    if (fontSize) {
      document.querySelector('html').style.fontSize = fontSize;
    }

    const menuOpen = localStorage.getItem('menuOpen');
    if (menuOpen) {
      this.menuOpen = menuOpen === 'true';
    }

  };

}
