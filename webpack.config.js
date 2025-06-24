const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = [
  // 👨‍💻 VS Code Extension (backend)
  {
    target: 'node',
    mode: 'development',
    entry: './src/extension.ts',
    output: {
      filename: 'extension.js',
      path: path.resolve(__dirname, 'dist'),
      libraryTarget: 'commonjs2',
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        }
      ],
    },
    externals: {
      vscode: 'commonjs vscode',
    },
    devtool: 'source-map',
  },

  // 🖼️ Webview React UI
  {
    target: 'web',
    mode: 'development',
    entry: './src/webview-ui/index.tsx',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'media'),
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
    loader: 'ts-loader',
    options: {
      configFile: 'tsconfig.webview.json'
    }
  },
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new CopyPlugin({
        patterns: [{ from: 'src/webview-ui/index.html', to: 'index.html' }],
      }),
    ],
  }
];
