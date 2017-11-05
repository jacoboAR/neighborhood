const path = require('path');

module.exports = {
    entry: {
        app: './src/js/index.js'
    },
    module: {
        rules: [
            {
                test: /\.(scss)$/,
                use: [{
                  loader: 'style-loader',
                }, {
                  loader: 'css-loader',
                }, {
                  loader: 'postcss-loader', 
                  options: {
                    plugins: function () { 
                      return [
                        require('autoprefixer')
                      ];
                    }
                  }
                }, {
                  loader: 'sass-loader'
                }]
            },
            {
                test: /\.js$/,
                include: path.resolve(__dirname, "src"),
                loader: "babel-loader"
            }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};