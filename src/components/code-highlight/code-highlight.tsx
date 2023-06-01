import { Component, Host, Prop, State, h, Element } from '@stencil/core';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import powershell from 'highlight.js/lib/languages/powershell';
import { decode } from 'html-entities';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import golang from 'highlight.js/lib/languages/go';
import css from 'highlight.js/lib/languages/css';
import http from 'highlight.js/lib/languages/http';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import plaintext from 'highlight.js/lib/languages/plaintext';



@Component({
  tag: 'code-highlight',
  styleUrl: 'code-highlight.css',
  shadow: true,
})
export class CodeHighlight {
  /** Exported for possibility to extend by package consumer */ 
  public static code_highlight = hljs;
  private static registered = false;

  constructor() {
    if (!CodeHighlight.registered) {
      CodeHighlight.registered = true;
      CodeHighlight.registerLanguages();
    }
  }

  /** the language of the code. If language is not included you may use {@link CodeHighlight.code_highlight} 
   *  property to register additional languages and aliases. The {@link CodeHighlight.code_highlight} is 
   * instance of highlight.js library.
   */
  @Prop() language: string = "plaintext";
 
  static registerLanguages() {
    hljs.registerLanguage('bash', bash);
    hljs.registerLanguage('css', css);
    hljs.registerLanguage('go', golang);
    hljs.registerLanguage('http', http);
    hljs.registerLanguage('javascript', javascript);
    hljs.registerLanguage('json', json);
    hljs.registerLanguage('powershell', powershell);
    hljs.registerLanguage('typescript', typescript);
    hljs.registerLanguage('xml', xml);
    hljs.registerLanguage('yaml', yaml);
    hljs.registerLanguage('dockerfile', dockerfile);
    hljs.registerLanguage('plaintext', plaintext);

    hljs.registerAliases(['golang'], { languageName: 'go' });
    hljs.registerAliases(['html', 'xhtml', 'rss', 'atom', 'xjb', 'xsd', 'xsl', 'plist'],{ languageName: 'xml' } );
    hljs.registerAliases(['https'], { languageName: 'http' });
    hljs.registerAliases(['js', 'jsx'], { languageName: 'javascript' });
    hljs.registerAliases(['ps', 'ps1'], { languageName: 'powershell' });
    hljs.registerAliases(['scss', 'sass'], { languageName: 'css' });
    hljs.registerAliases(['sh'], { languageName: 'bash' });
    hljs.registerAliases(['shell'], { languageName: 'powershell' });
    hljs.registerAliases(['ts', 'tsx'], { languageName: 'typescript' });
    hljs.registerAliases(['webmanifest'], { languageName: 'json' });
    hljs.registerAliases(['yml'], { languageName: 'yaml' });
    hljs.registerAliases(['plain', 'text'], { languageName: 'plaintext' });
    hljs.registerAliases(['docker'], { languageName: 'dockerfile' });
  }

  private code: string;
  private lines: { index:number, type: string, text: string}[] = [];
  @State() highlight: string;

  render() {
    return (
      <Host>
        <div class="wrapper">
          <pre>
            <div class="hljs" innerHTML={this.highlight} onClick={ (ev:Event)=>this.onLineClick(ev)}></div> 
          </pre>
          <div class="tools">
            <div class="lang-label">{hljs.getLanguage(this.language)?.name}</div>
            <md-standard-icon-button  class="copy" onClick={() => {
              navigator.clipboard.writeText(this.code);
            }}><md-icon>content_copy</md-icon></md-standard-icon-button>
          </div>
        </div>
      </Host>
    );
  }

  @Element() host: HTMLElement;

  componentWillLoad() {
    let code = this.host.innerHTML;
    code = decode(code);

    this.lines = [];
    this.code = code.split('\n').map((line, index) => {
      /** match regex and take first group*/
      const regex = /@_([a-z\-_]+)_@/;
      const pfxRegex = /<[pP]fx>/g;
      const match = line.match(regex);
      if (match) {
        line = line.replace(regex, '');
        this.lines.push({ index, type: match[1], text: line });
        if (match[1] === 'remove') {
          return null;
        }
        return line.replace(pfxRegex, '__pfx__'); 
      }
      return line.replace(pfxRegex, '__pfx__');
    }).filter(l => l !== null).join('\n');
    
    try {
      this.highlight = hljs.highlight(this.code, { language: this.language, ignoreIllegals: true },).value;
    } catch (e) {
      console.log(e);
      this.highlight = this.code;
    }

    this.highlight = this.highlight.split('\n').map((line, index) => {
      const lineIndex = this.lines.findIndex(l => l.index === index);
      if (lineIndex > -1) {
        const lineType = this.lines[lineIndex].type;
        return `<line-bg class="${lineType}" index="${index}"><md-icon class="line">content_copy</md-icon>${line}</line-bg>`;
      }
      return line;
    }).join('\n')
    this.highlight = this.highlight
      .replace(/<\/line-bg>\s+<line-bg [^>]*>/gm, '\n')
      .replace(/__pfx__/g, '<span class="pfx">&lt;pfx&gt;</span>');
    
  }

 private onLineClick(ev: Event) {
    if( ev.target instanceof HTMLElement && ev.target.tagName === 'MD-ICON') {
      const line = ev.target.parentElement;
      const indexAttr = line.getAttribute('index');
      if (indexAttr === null) { return; }
      let codeLineIndex = +indexAttr;
      
      const lines: string[] = [];
      let backgroundType = "";

      let bgIndex =  this.lines.findIndex(l => l.index === +codeLineIndex);
      while( bgIndex > -1 && (!backgroundType || backgroundType === this.lines[bgIndex].type)) {
        lines.push(this.lines[bgIndex].text);
        backgroundType = this.lines[bgIndex].type;
        codeLineIndex++;
        bgIndex = this.lines.findIndex(l => l.index === +codeLineIndex);
      }
      navigator.clipboard.writeText(lines.join('\n'));
    }
  }
}
