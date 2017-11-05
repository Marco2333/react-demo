# webpack从入门到放弃

## 一、webpack简介
### 1.1 什么是webpack
webpack是一个module bundler（模块打包工具），所谓的模块就是在平时的前端开发中，用到一些静态资源，如JavaScript、CSS、图片等文件，webpack就将这些静态资源文件称之为模块。
webpack支持AMD和CommonJS，以及其他的一些模块系统，并且兼容多种JS书写规范，可以处理模块间的依赖关系，所以具有更强大的JS模块化的功能，它能对静态资源进行统一的管理以及打包发布。
它在很多地方都能替代Grunt和Gulp，因为它能够编译打包CSS，做CSS预处理，对JS的方言进行编译，打包图片，代码压缩等等。

### 1.2 为什么使用webpack
- 对 CommonJS 、AMD 、ES6的语法做了兼容；
- 对js、css、图片等资源文件都支持打包；
- 串联式**模块加载器**以及**插件机制**,让其具有更好的灵活性和扩展性，例如提供对CoffeeScript、ES6的支持；
- 有独立的配置文件webpack.config.js；
- 可以将代码切割成不同的chunk，实现按需加载，降低了初始化时间；
- 支持 SourceUrls 和 SourceMaps，易于调试；
- 具有强大的Plugin接口，大多是内部插件，使用起来比较灵活；
- webpack 使用异步 IO 并具有多级缓存。这使得 webpack 很快且在增量编译上更加快；

## 二、开始使用webpack
### 2.1 安装
```js
// 创建package.json文件
npm init
```
```js
//全局安装
npm install -g webpack
//安装到你的项目目录
npm install --save-dev webpack
```

### 2.2 创建项目结构
![](https://github.com/Marco2333/react-demo/blob/master/demo/demo00%20webpack/1.png)

index.html
```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Webpack</title>
    </head>
    <body>
        <div id='root'></div>
        <script src="bundle.js"></script>
    </body>
</html>
```

Greeter.js
```js
// Greeter.js
module.exports = function() {
    var greet = document.createElement('div');
    greet.textContent = "Hi there and greetings!";
    return greet;
};
```

main.js
```js
//main.js 
var greeter = require('./Greeter.js');
document.getElementById('root').appendChild(greeter());
```

### 2.3 正式使用webpack
#### 终端运行最基础的命令
```js
webpack {entry file/入口文件} {destination for bundled file/存放bundle.js的地方}
```
只需要指定一个入口文件，webpack将自动识别项目所依赖的其它文件。
```js
// webpack非全局安装的情况
// linux
./node_modules/.bin/webpack app/main.js public/bundle.js
// windows
.\\node_modules\\.bin\\webpack app/main.js public/bundle.js
// webpack全局安装的情况
webpack app/main.js public/bundle.js
```

#### 通过配置文件来使用webpack
webpack拥有很多其他的高级功能，这些功能都可以使用命令行形式实现，但是使用命令行的形式不太方便并且容易出错，一种更好的办法是采用配置文件的形式，一个配置文件也是一个JavaScript模块，可以把所有的与构建相关的信息放在里面。
定义webpack.config.js，上面的例子可以写成如下的配置文件形式：
```js
module.exports = {
    entry:  __dirname + "/app/main.js",//唯一入口文件
    output: {
        path: __dirname + "/public",//打包后的文件存放的地方
        filename: "bundle.js"//打包后输出文件的文件名
    }
}
```
在命令行中运行：
```js
// webpack非全局安装的情况
// linux
./node_modules/.bin/webpack
// windows
.\\node_modules\\.bin\\webpack
// webpack全局安装的情况
webpack
```

#### npm 引导执行任务
如果没有全局安装webpack，直接运行./node_modules/.bin/webpack是比较麻烦并且容易出错的，我们可以通过npm引导任务执行，对其进行配置之后，可以使用`npm start`命令来代替这些命令。
```js
"scripts": {
    "start": "webpack" // 相当于把 npm 的 start 命令指向 webpack 命令
}
```
package.json中的脚本部分已经默认在命令前添加了./node_modules/.bin路径，所以无论是全局还是局部安装的Webpack，都不需要写前面那指明详细的路径了。
另外，npm的start是一个特殊的脚本名称，它的特殊性表现在，在命令行中使用npm start就可以执行相关命令，如果对应的此脚本名称不是start，想要在命令行中运行时，需要这样用npm run {script name}如npm run build。

## 三、强大的webpack
### 3.1 生成Source Maps
开发总是离不开调试，如果可以更加方便的调试当然就能提高开发效率，不过打包后的文件有时候不容易找到出错的地方对应的源代码位置，Source Maps就是来解决这个问题的。
在webpack的配置文件中配置source maps，需要配置devtool，它有以下四种不同的配置选项：
- source-map: 在一个单独的文件中产生一个完整且功能完全的文件。这个文件具有最好的source map，但是它会减慢打包文件的构建速度；
- cheap-module-source-map: 在一个单独的文件中生成一个不带列映射的map，不带列映射提高项目构建速度，但是也使得浏览器开发者工具只能对应到具体的行，不能对应到具体的列（符号），会对调试造成不便
- eval-source-map: 使用eval打包源文件模块，在同一个文件中生成干净的完整的source map。这个选项可以在不影响构建速度的前提下生成完整的sourcemap，但是对打包后输出的JS文件的执行具有性能和安全的隐患。不过在开发阶段这是一个非常好的选项，但是在生产阶段一定不要用这个选项
- cheap-module-eval-source-map: 这是在打包文件时最快的生成source map的方法，生成的Source Map 会和打包后的JavaScript文件同行显示，没有列映射，和eval-source-map选项具有相似的缺点；
```js
module.exports = {
    devtool: 'eval-source-map',//配置生成Source Maps，选择合适的选项
    entry:  __dirname + "/app/main.js",
    output: {
        path: __dirname + "/public",
        filename: "bundle.js"
    }
}
```

### 3.2 使用webpack构建本地服务器
webpack提供一个可选的本地开发服务器，可以检测代码的修改，并自动刷新浏览器的结果。该本地服务器基于node.js构建，在使用前我们需要单独安装作为项目依赖。
```js
npm install --save-dev webpack-dev-server
```

配置选项：
- contentBase: 默认webpack-dev-server会为根文件夹提供本地服务器，如果想为另外一个目录下的文件提供本地服务器，应该在这里设置其所在目录（本例设置到“public"目录）
- port: 设置默认监听端口，如果省略，默认为“8080”
- inline: 设置为true，当源文件改变时会自动刷新页面
- historyApiFallback: 在开发单页应用时非常有用，它依赖于HTML5 history API，如果设置为true，所有的跳转将指向index.html

启动server：
```js
//webpack非全局安装的情况
//linux
./node_modules/.bin/webpack-dev-server
//windows
.\\node_modules\\.bin\\webpack-dev-server
//使用npm
//package.json
"server": "webpack-dev-server"
//运行
npm run server
```

### 3.3 Loaders
Loaders是webpack中最激动人心的功能之一了。使用不同的loader，webpack通过调用外部脚本或者工具可以对不同格式的文件进行处理。
Loaders需要单独安装并且需要在webpack.config.js下的modules关键字下进行配置，Loaders的配置选项包括以下几方面：
- test: 一个匹配loaders所处理的文件的拓展名的正则表达式（必须）
- loader: loader的名称（必须）
- include/exclude:手动添加必须处理的文件（文件夹）或屏蔽不需要处理的文件（文件夹）（可选）；
- query: 为loaders提供额外的设置选项（可选）

#### 3.3.1 babel
Babel其实是一个编译JavaScript的平台，它的强大之处表现在可以通过编译帮你达到以下目的：
- 下一代的JavaScript标准（ES6，ES7），这些标准目前并未被当前的浏览器完全的支持；
- 使用基于JavaScript进行了拓展的语言，比如React的JSX

安装依赖包：
```js
// npm一次性安装多个依赖模块，模块之间用空格隔开
npm install --save-dev babel-core babel-loader babel-preset-es2015 babel-preset-react
```

在webpack.config.js中配置babel
```js
module.exports = {
    devtool: 'eval-source-map',

    entry: __dirname + "/app/main.js",
    output: {
        path: __dirname + "/public",
        filename: "bundle.js"
    },

    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader', //在webpack的module部分的loaders里进行配置即可
            query: {
                presets: ['es2015', 'react']
            }
        }]
    },
    devServer: {
        contentBase: "./public",
        historyApiFallback: true,
        inline: true
    }
}
```

安装react
```js
npm install --save react react-dom
```

使用ES6的语法，更新Greeter.js：
```jsx
//Greeter,js
import React, {Component} from 'react'

class Greeter extends Component{
    render() {
        return (
          <div>
            <span>Marco</span>
          </div>
        );
    }
}

export default Greeter
```
```js
//main.js
import React from 'react';
import {render} from 'react-dom';
import Greeter from './Greeter';
render(<Greeter />, document.getElementById('root'));
```

**Babel的配置选项**
因为babel有非常多的配置选项,在单一的webpack.config.js文件中进行配置往往使得这个文件显得太复杂，因此一些开发者支持把babel的配置选项放在一个单独的名为 ".babelrc" 的配置文件中。因此现在我们就提取出相关部分，分两个配置文件进行配置（webpack会自动调用.babelrc里的babel配置选项）。
```js
// webpack.config.js
module.exports = {
    devtool: 'eval-source-map',

    entry: __dirname + "/app/main.js",
    output: {
        path: __dirname + "/public",
        filename: "bundle.js"
    },

    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }]
    },

    devServer: {
    } // Omitted for brevity
}
```
```js
//.babelrc
{
  "presets": ["react", "es2015"]
}
```

#### 3.3.2 CSS
**一切皆模块**
webpack将所有的文件都当做模块处理，包括JavaScript、css、fonts、图片等，只要通过合适的loaders，它们都可以被当做模块来处理。

webpack提供两个工具处理样式表，css-loader 和 style-loader，二者处理的任务不同，css-loader使你能够使用类似@import 和 url(...)的方法实现 require()的功能，style-loader将所有的计算后的样式加入页面中，二者组合在一起使你能够把样式表嵌入webpack打包后的JS文件中。

安装loader:
```js
//安装
npm install --save-dev style-loader css-loader
```

webpack.config.js
```js
//使用
module.exports = {
    devtool: 'eval-source-map',

    entry:  __dirname + "/app/main.js",
    output: {
        path: __dirname + "/build",
        filename: "bundle.js"
    },

    module: {
    loaders: [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        },
        {
            test: /\.css$/,
            loader: 'style-loader!css-loader'//添加对样式表的处理
        }]
    },

    devServer: {}
}
```
在app文件夹下创建main.css：
```css
html {
    box-sizing: border-box;
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
}

*, *:before, *:after {
    box-sizing: inherit;
}

body {
    margin: 0;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

h1, h2, h3, h4, h5, h6, p, ul {
    margin: 0;
    padding: 0;
}
```

将main.css引入main.js中（因为webpack只有单一的入口）
```js
import './main.css';//使用require导入css文件
```

## 四、解决webpack打包慢的问题
每次修改代码，gulp或者webpack检测到都会重新打包。但是，大多数情况下，需要重新打包的只有业务代码，其余的第三方库是不需要重新打包的，它们的存在只会减慢打包性能，所以我们需要优化打包过程。

### 4.1 配置external
```js
module.exports = {
    externals: {
        'react': 'window.React',
        'react-dom': 'window.ReactDOM'
    }
    //其它配置忽略...... 
};
```
这样react和react-dom就不需要打包了，不过需要提前加载react.min.js和react-dom.min.js，让全局中存在React和ReactDOM变量。

**配置external**的缺陷
- 如果我们依赖的一些没有设置到externals中的模块依赖了已经设置到externals中的模块，被依赖的模块依然会重新打包
- 有些模块或库没有提供类似 ***.min.js 文件

### 4.2手工打包module，设置externals
创建lib-bundle.js文件
```js
window.__LIB["react"] = require("react");
window.__LIB["react-addons-css-transition-group"] = require("react-addons-css-transition-group");
// ...其它依赖包
```
这里我们把一些第三方库注册到了`window.__LIB`下，这些库可以作为底层的基础库，免于重复打包。
然后执行：
```js
webpack lib-bundle.js lib.js
```
得到打包好的lib.js，再去设置externals:
```js
var webpack = require('webpack');
module.exports = {
    externals: {
        'react': 'window.__LIB["react"]',
        'react-addons-css-transition-group': 'window.__LIB["react-addons-css-transition-group"]',
        // 其它库
    }
    //其它配置忽略...... 
};
```

### 4.3 使用webpack.DllPlugin
在windows操作系统中，动态链接库（dll）是一种很常见的思想。一个dll包，就是一个很纯净的库，它本身不能运行，是用来给你的app或者业务代码引用的。

同样的 Webpack最近也新加入了这个功能：`webpack.DllPlugin`。
使用这个功能需要把打包过程分成两步：
- 打包dll包
- 引用dll包，打包业务代码

配置 dll.config.js:
```js
const path = require('path');
const webpack = require('webpack');

const vendors = [
    'react',
    'react-dom',
    // ...其它库
];

module.exports = {
    output: {
        path: path.resolve(__dirname, './public'),
        filename: '[name].js',
        library: '[name]',
    },
    entry: {
        "lib": vendors,
    },
    plugins: [
        new webpack.DllPlugin({
            path: 'manifest.json',
            name: '[name]',
            context: __dirname,
        }),
    ],
};
```
webpack.DllPlugin 的选项中：
- path 是 manifest.json 文件的输出路径，这个文件会用于后续的业务代码打包；
- name 是dll暴露的对象名，要跟 output.library 保持一致；
- context 是解析包路径的上下文，这个要跟接下来配置的 webpack.config.js 一致。

配置 package.json :
```js
"dll": "webpack --config ./dll.config.js"
```
运行：
```js
npm run dll
```
生成 lib.js 和 manifest,json。

接下来打包webpack.config.js:
```js
const webpack = require('webpack');

module.exports = {
    devtool: 'eval-source-map',
    // externals: {
    //  'react': 'window.React',
    //  'react-dom': 'window.ReactDOM'
    // },
    entry: __dirname + "/app/main.js",
    output: {
        path: __dirname + "/public",
        filename: "bundle.js"
    },

    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }]
    },

    plugins: [
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require('./manifest.json'),
        })
    ],

    devServer: {} // Omitted for brevity
}
```
webpack.DllReferencePlugin 的选项中：
- context 需要跟之前保持一致，这个用来指导 Webpack 匹配 manifest 中库的路径
- manifest 用来引入刚才输出的 manifest.json 文件

然后，在页面中引用lib.js和bundle.js就可以了。

其实还有一个速度的优化点，就是配置babel，让它排除一些文件，当loader这些文件时不进行转换，自动跳过；可在.babelrc文件中配置，示例：
```js
{
    "presets": ['es2015', 'react'],
    "ignore":[
        "jquery.js",
        "jquery.min.js",
        "angular.js",
        "angular.min.js",
        "bootstrap.js",
        "bootstrap.min.js"
    ]
}
```

最后，运行`webpack --watch`，然后，我们就可以静静地写业务逻辑代码了 。。。

参考链接：
<br/>
[http://blog.csdn.net/fengyinchao/article/details/52100357](http://blog.csdn.net/fengyinchao/article/details/52100357) </br>
[http://www.jianshu.com/p/42e11515c10f](http://www.jianshu.com/p/42e11515c10f)