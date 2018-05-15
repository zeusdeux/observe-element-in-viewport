import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import sourcemaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript'
import ts from 'typescript'

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'umd',
    name: 'observeElementInViewport',
    sourcemap: true,
    perf: true
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      typescript: ts
    }),
    sourcemaps()
  ]
}
