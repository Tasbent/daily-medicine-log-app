const path = require('path');

module.exports = {
  // This tells webpack where to start reading your code
  // It's like telling someone "start reading the story from this page"
  entry: './app.js',
  
  // This tells webpack where to save the processed code
  // We're creating a 'public' folder to keep source and built code separate
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'public'),
  },
  
  // These are the transformation rules
  // Like a recipe that says "when you see ingredients like this, prepare them this way"
  module: {
    rules: [
      {
        // This pattern matches any .js or .jsx file
        test: /\.jsx?$/,
        // But skip the node_modules folder (those are already processed)
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',   // Transforms modern JS to older JS
              '@babel/preset-react'  // Transforms JSX to regular JS
            ]
          }
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      }
    ]
  },
  
  // Production mode makes the output smaller and faster
  mode: 'production'
};
