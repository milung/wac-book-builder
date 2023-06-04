# Book Builder

PWA application for viewing/reading a book generated from the set of markdown files. 

## Usage 

The project assumes source of the markdown files placed at the `book-src` folder. Nevertheless this is assumed to be available only when mounting it to the docker container. The docker container is then used to generate the book and serve it. Durring development you may create this folder and place there sample files. 

### Build the docker image

```bash
docker build -t book-builder -f build/docker/Dockerfile .
```

### Create and test the book

Create a separate folder/repository with the `book-src` folder inside. The `book-src` folder should contain the markdown files (see below for features supported) and the `_toc.md` file with the table of contents. 

```bash
docker run --rm -v <path-to-book-src>://usr/src/app/book-src  -p 3380:3380 book-builder
```
This will watch the `book-src` folder for changes and rebuild the book when needed. The book will be served at http://localhost:3380/. The page needs to be manually reloaded after the watch rebuilds the book, and port shall be 3380 to make SPA routing work.

### Build the book server container

Once you are ready with your book you can build the container that will serve it. The container will contain only the static files of the book and will not contain the source markdown files. 

Here is a recommended dockerfile for creating a production book server container:

```dockerfile
FROM milung/book-builder as book-builder
LABEL maintainer="your@organization.com"
ARG version=latest
ARG title="Book Title"
ARG description="Book description"
ARG author="Thats You"
ARG email="your@organization.com"
ARG figure_caption="Figure %d."

WORKDIR /usr/src/app
COPY book-src/ book-src/
COPY favicon.ico ./src/assets/icon/favicon.ico
COPY favicon.png ./src/assets/icon/favicon.png

#generate book
RUN node ./build/makehtml/makehtml.mjs  --verbose --version ${version} 

RUN npm run build

# generate index.html
RUN node build/makehtml/version.js \
     --version ${version} \
     --title "${title}" \
     --description "${description}" \
     --author "${author}" \
     --email "${email}" \
     --image-caption "${figure_caption}" 

## build SPA server executable
FROM milung/spa-server as spa-builder

COPY --from=book-builder /usr/src/app/www public
RUN ./build.sh

## final server image - listens on port 8080
FROM scratch

COPY --from=spa-builder /app/server /server
EXPOSE 8080
CMD ["/server"] 
```

The generated server is SPA server, see details of configuration options at https://github.com/SirCremefresh/spa-server .

## Markdown features supported

The markdown files are processed by the [marked](https://marked.js.org/) with some dedicated extensions. The following extensions are supported:

### Symbolic links
All files will automatically include `_links.md` file from the root of the `book-src` folder. This file may contain hyperlinks to be included in all files by reference. Example: 

    ```markdown
    [GitHub]:https://github.com
    [Google]:https://google.com
    ```

    then you may use the links in the markdown files by:

    ```markdown
    See me on [GitHub]. 
    Or search me on [Google].
    ```

### Table of contents
You may place a table of content into the file "_toc.html" in the root of the `book-src` folder, additionally you may palce additional folder in other folders and include them by `[#include <relative-path.md>]` command. The table of contents is then rendered as a side bar, where included files represent sections to be expanded only when user navigates to the particular section. Keep only hyperlinks in the table of contents, horizontal lines `<hr />` and eventually put hyperlinks into the `##` headers to emphasize them.  Other features of markdown can break the rendering. 
  
   Hyperlinks may have defined custom icons by the following syntax: `[$icon-name> Label](<link-url>)`. The icon name is the name of the icon from the [fontawesome](https://fontawesome.com/icons?d=gallery) library. The icon name is followed by `>` character and prefixed by `$`. The label is the text of the hyperlink. The link url is the url of the hyperlink. If icon name is not prefixed by the `$` character, then the icon is taken from [Material Symbols](https://fonts.google.com/icons). Name of the icon uses dash `-` instead of underscore `_` as in the fontawesome library.

   Example of `_toc.md`:

   ```markdown
   [$graduation-cap> Introduction](./README.md)
   [Prologue](./prologue.md)

   <hr />
   ## [language> Chapter 1: Web development](dojo/web/000-README.md)

   [#include dojo/web/_toc.md]
   <hr />
   ```
### Blockquotes with icons

You may place a blockquote with an icon by the following syntax: `>$icon-name:> Blockquote text]`. The icon name is the name of the icon from the [fontawesome](https://fontawesome.com/icons?d=gallery) library. The icon name is followed by `:>` characterz and prefixed by `$`. The blockquote text is the text of the blockquote. If icon name is not prefixed by the `$` character, then the icon is taken from [Material Symbols](https://fonts.google.com/icons).

### Highlighted code blocks

You may place a highlighted code block by the following syntax: `>```language`. The language is the name of the language for the syntax highlighting. Inside the block you may mark a line as inserted by placing the text `@_add_@` on that line; or you may mark a line as removed by placing the text `@_remove_@` on that line; or you may mark a line as important by placing the text `@_important_@` on that line. The rendering of that line will be highlighted by the corresponding color. 

### Limitations
It is possible that some features of the markdown will be not rendered properly. The builder is specifically designed to serve particular textbook and it is not intended to be used for general purpose. In case you see issues with the rendering, please, create an issue and we will try to fix it.
