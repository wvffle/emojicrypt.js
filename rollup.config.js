import resolve from 'rollup-plugin-node-resolve';
import globals from 'rollup-plugin-node-globals'
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/emojicrypt.js',
    format: 'umd',
    name: 'emojicrypt',
  },
  plugins: [
    globals({
      buffer: false,
    }),
    commonjs(),
    resolve(),
  ]
};
