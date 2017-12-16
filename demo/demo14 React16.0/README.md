React16.0于9月26日正式发布了，新的版本做了较大的改动，其中一些新的特性开发者期待已久，包括：
- __fragments(返回碎片类型)__
- __error boundaries(更好的异常处理)__
- __portals(挂载方式)__
- __support for custom DOM attributes(支持用户自定义属性) __
- __improved server-side rendering(提高服务端渲染性能)__
- __reduced file size(减小了文件大小)__

### render函数新的返回类型：fragments and strings
组件的render函数可以返回一个包含元素的数组，但是需要为数组中的每个元素添加`key`属性。

```jsx
render() {
    // No need to wrap list items in an extra element!
    return [
        // Don't forget the keys :)
        <li key="A">First item</li>,
        <li key="B">Second item</li>,
        <li key="C">Third item</li>,
    ];
}
```
React16.2.0中加入了新的特性，支持特殊的`fragment`语法使元素不必添加`key`属性。

```jsx
render() {
    return (
        <>
            Some text.
            <h2>A heading</h2>
            More text.
            <h2>Another heading</h2>
            Even more text.
        </>
    );
}
```

目前`render`方法支持的返回类型有：
- React元素(可以是原生DOM原生，或者用户自定义复合组件)
- String和numbers(被渲染为DOM中的`text node`)
- Portals(由`ReactDOM.createPortal`创建)
- null(不渲染任何元素)
- Booleans(不渲染任何元素，多用于支持以下模式：`return test && <Child />`，其中`test`为`boolean`类型)

当返回`null`或`alse`时，`ReactDOM.findDOMNode(this)`返回`null`。

### 更好的异常处理
在之前的版本中，如果在渲染过程中遇到运行时错误，可能会导致React崩溃并产生一些隐藏的异常信息，需要刷新页面才能恢复。为了解决这个问题，React16采用了更有弹性的异常处理策略。

默认情况下，如果组件的render方法或者其它生命周期方法中抛出异常，那么整个组件树将会从根节点上卸载，这样能够防止展示被损坏的不一致的信息，但是可能会影响用户体验。

在新版本中，我们可以利用`error boundaries`(错误边界)来处理异常，而不是每次出现错误都卸载整个应用。`error boundaries`是一个特殊的组件，它可以捕获子树的异常，并在视图中展示错误信息。`error boundaries`类似于`try-catch`，只是它专用于React组件而已。

### Portals
`Portals`可以将`children`插入到存在于父组件层级之外的节点中。
```jsx
render() {
    // React does *not* create a new div. It renders the children into `domNode`.
    // `domNode` is any valid DOM node, regardless of its location in the DOM.
    return ReactDOM.createPortal(
        this.props.children,
        domNode,
    );
}
```

### 更好的服务端渲染
React16完全重写了服务端渲染器，更好地支持服务端渲染。新的渲染器支持__`streaming(流)`__，渲染流的方式可以减少客户端获取响应首字节需要的毫秒数`TTFB`，渲染结果以流的方式传输到客户端，这样可以更早地向客户端传送数据，而客户端也可以更早地开始解析渲染页面。

另外，在React16中，当服务端渲染的HTML到达客户端之后，客户端的初次渲染不再要求准确匹配服务端渲染的结果，而是尽可能的重用已经存在的DOM节点避免重复渲染，所以也不再需要计算`react-check-sum`。

### 支持用户自定义DOM属性
React16不再忽略那些无法识别的HTML和SVG属性，而是直接将这些属性传递给DOM元素。这样可以避免使用React属性白名单，从而减少文件的大小。

### 文件大小减小
尽管增加了很多新的特性，React16的文件大小比React15.6.1小了32%左右(gzip之后约为30%)。
- react：5.3 kb (2.2 kb gzipped)，之前为 20.7 kb (6.9 kb gzipped).
- react-dom：103.7 kb (32.6 kb gzipped)，之前为 141 kb (42.9 kb gzipped).
- react + react-dom：109 kb (34.8 kb gzipped)，之前为 161.7 kb (49.8 kb gzipped).

### MIT协议
React16切换回了MIT协议，同时针对不能立即升级的React用户，React15.6.2也切换回了MIT协议。

### 新的核心架构
React16是第一个基于`Fiber`的版本，关于Fiber的介绍参考__[这里](https://github.com/Marco2333/react-demo/tree/master/demo/demo13%20Fiber)__。

React16带来的很多新的特性大多基于新的核心架构—`Fiber`，在接下来的几个版本中将会发布更多新的特性。其中，最让人兴奋的可能就是__`async rendering(异步渲染)`__了：一种能够通过周期性向浏览器发布执行任务从而协同调度渲染工作的策略。这样可以实现异步渲染，从而避免阻塞主线程，应用会更加`responsive`。

__`async rendering(异步渲染)`__是一个非常重要的特性，它代表了React的未来。为了保证向React16上迁移尽可能平滑，React16中并没有开启任何异步特性，但在接下来的版本中将会逐步启用，大家拭目以待。

### 一些比较大的改变
- React15通过`unstable_handleError`对`error boundaries`作了有限的支持，该方法被重名为`componentDidCatch`。
- 如果`ReactDOM.render` 和`ReactDOM.unstable_renderSubtreeIntoContainer`在生命周期方法中调用则返回`null`，为了解决这个问题，可以使用`portals` 或`refs`。
- setState
	- 如果 `setState`方法的参数为`null`则不会触发更新
	- 在`render`方法中直接调用`setState`方法会触发更新，在之前的版本中不会触发更新。但是，我们仍然不应该在`render`方法中调用setState`。
	- `setState`回调函数(第二个参数)会在`componentDidMount` / `componentDidUpdate`之后立刻触发，而不是所有组件渲染完毕之后。
- 如果用`<B />`替换`<A />`，`B.componentWillMount`总是在`A.componentWillUnmount`之前被触发，而在之前的版本中，在某些情况下`A.componentWillUnmount`可能被首先触发。
- 在之前的版本中，修改组件的`ref`时，`ref`和`dom`会在组件的`render`方法被调用之前分离。新版本中，直到DOM更新之后，`ref`和`dom`才会分离。
- 如果一个容器被除React之外的方法修改，那么将组件重新渲染到该容器中是不安全的。在之前的版本中可能会生效，但React并不支持这样做，在新的版本中将会触发warning，你需要使用`ReactDOM.unmountComponentAtNode`来清空你的节点树。[查看示例](https://github.com/facebook/react/issues/10294#issuecomment-318820987)
- `componentDidUpdate`生命周期方法不再接收`prevContext`参数。
- `Shallow renderer`不再调用`componentDidUpdate`，因为`DOM refs`不再有效，这样与`componentDidMount`保持一致(在之前的版本中，不会被调用)。
- `shallow renderer`不再实现`unstable_batchedUpdates()`。

### 打包
- 不再有`react/lib/*`和`react-dom/lib/*`，即使在CommonJS环境中，React和ReactDOM被预编译成单个文件。
- 没有`react-with-addons.js`，所有兼容的插件将会被单独发布到npm上，同时会有对应的单文件浏览器版本。
- 新版本的核心库中移除了15.x中的`deprecations`(宣布将要弃用的功能)。对应的功能在单独的包中实现：
	- `React.createClass`对应的包：`create-react-class`
	- `React.PropTypes`对应的包：`prop-types`
	- `React.DOM`对应的包：`react-dom-factories`
	- `react-addons-test-utils`对应的包：`react-dom/test-utils`
	- `shallow renderer`对应的包：`react-test-renderer/shallow`
- 浏览器单文件构建版本的名字和路径发生改变以强调开发环境与生存环境的不同：
	- react/dist/react.js → react/umd/react.development.js
	- react/dist/react.min.js → react/umd/react.production.min.js
	- react-dom/dist/react-dom.js → react-dom/umd/react-dom.development.js
	- react-dom/dist/react-dom.min.js → react-dom/umd/react-dom.production.min.js