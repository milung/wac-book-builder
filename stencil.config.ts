import { Config } from '@stencil/core';

// https://stenciljs.com/docs/config

export const config: Config = {
  globalStyle: 'src/global/app.css',
  globalScript: 'src/global/app.ts',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'www',
      serviceWorker: {
        globPatterns: [
          '**/*.{js,css,json,html, woff, woff2, png, jpg, jpeg, gif, svg, ttf, eot, ico}'
        ]
      },
      baseUrl: '/',
      copy: [
        { src: 'book' },
      ]
    },
  ],
};
