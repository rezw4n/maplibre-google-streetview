import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';

const pkg = require('./package.json');

export default [
  // UMD build
  {
    input: 'src/index.js',
    output: {
      name: 'MaplibreGoogleStreetView',
      file: pkg.main,
      format: 'umd',
      globals: {
        'maplibre-gl': 'maplibregl'
      }
    },
    external: ['maplibre-gl'],
    plugins: [
      resolve(),
      commonjs(),
      postcss({
        inject: true,
        minimize: true,
        extract: 'maplibre-google-streetview.css',
        url: {
          url: 'inline',
          maxSize: 10,
          fallback: 'copy'
        }
      }),
      terser(),
      copy({
        targets: [
          { src: 'src/images/*', dest: 'dist/images' }
        ]
      })
    ]
  },
  // ESM build
  {
    input: 'src/index.js',
    output: {
      file: pkg.module,
      format: 'es'
    },
    external: ['maplibre-gl'],
    plugins: [
      resolve(),
      commonjs(),
      postcss({
        inject: false,
        minimize: false,
        extract: 'maplibre-google-streetview.css',
        // Embed images as base64
        url: {
          url: 'inline',
          maxSize: 10, // in kb
          fallback: 'copy'
        }
      })
    ]
  }
];