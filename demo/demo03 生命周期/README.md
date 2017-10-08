# React组件生命周期
基本上所有React组件生命周期方法可以分为下面三个阶段：
- 挂在(Mounting): 这个阶段发生在组件被创建并被插入到DOM时
- 更新(Updating): 这个阶段发生在组件被重新渲染成虚拟DOM并决定实际DOM是否需要更新时
- 卸载(Unmounting): 这个阶段发生在组件从DOM中被删除时

## 组件挂载阶段
ES5(React.createClass)
- `getInitialState()`
- `componentWillMount()`
- `render()`
- `componentDidMount()`

ES6(React.Component)
- `constructor()`
- `componentWillMount()`
- `render()`
- `componentDidMount()`

## 组件更新阶段
- `componentWillReceiveProps()`
- `shouldComponentUpdate()`
- `componentWillUpdate()`
- `render()`
- `componentDidUpdate()`

## 组件卸载阶段
- `componentWillUnmount()`

## 以一图以蔽之
![](https://github.com/Marco2333/react-demo/tree/master/demo/images/demo03_1.png)
## Reference

### constructor()
```js
constructor(props)
```

在React组件被挂载之前，构造器constructor()首先被调用，由于继承了React.Component，我们必须在其他语句之前首先调用`super(props)`；否则，在构造器中`this.props`的值为undefined，从而引发错误。
我们可以在构造器中完成初始化组件属性或者绑定方法的功能，如果不需要初始化属性或者绑定方法，则不需要定义构造器。
```js
constructor(props) {
    super(props);
        this.state = {
        color: props.initialColor
    };
}
```

### componentWillMount()
```js
componentWillMount()
```
在组件挂载之前，`componentWillMount()`方法将会被调用。`componentWillMount()`方法在`render()`方法之前被调用，所以在该方法中设置状态不会触发重新渲染。

### render()
```js
render()
```
render()方法是必须的，并返回null、false 或者一个React Element。
当返回 null 或者 false 时，表示你不想渲染任何东西；并且，`ReactDOM.findDOMNode(this)`将会返回null。
`render()`应该是纯粹的（pure），它不应该修改组件的状态，每次调用 都会返回相同的结果，它不直接与浏览器交互。如果我们想与浏览器进行交互，我们应该在`componentDidMount()`方法中完成相应的功能。

### componentDidMount()
```js
componentDidMount()
```
componentDidMount()将会在组件挂载之后被调用，在该方法中修改state将会触发重新渲染。可以在该方法中加载远程数据，然后根据新的数据渲染DOM。

### componentWillReceiveProps()
```js
componentWillReceiveProps(nextProps)
```
组件的props可以通过父辈组件来更改， componentWillReceiveProps()会在一个被挂载的组件接收到新属性的时候被调用，有的时候尽管没有属性发生改变，React 依然会调用componentWillReceiveProps()，所以如果我们只想处理属性改变的情况，我们需要对比 this.props 和 nextProps 。
在初始挂载的时候`componentWillReceiveProps`不会被调用，调用`this.setState`通常不会触发`componentWillReceiveProps`。

### shouldComponentUpdate()
```js
shouldComponentUpdate(nextProps, nextState)
```
默认情况下，在状态发生改变的时候，组件会重新渲染，在渲染之前，`shouldComponentUpdate()`将会被调用，默认返回`true`。在组件初始渲染或者调用`forceUpdate()`时，该方法不会被调用。
如果`shouldComponentUpdate()`返回false，那么`componentWillUpdate()`、`render()`、`componentDidUpdate()`将不会被调用，但是返回`false`不会影响子组件的重新渲染。

### componentWillUpdate()
```js
componentWillUpdate(nextProps, nextState)
```
在渲染之前，componentWillUpdate()将会被调用，组件第一次渲染之前不会调用该方法。
注意，我们不能在这里调用`this.setState()`，如果我们需要更新状态，我们应该在`componentWillReceiveProps()`中进行更新。

### componentDidUpdate()
```js
componentDidUpdate(prevProps, prevState)
```
更新完成之后，componentDidUpdate()会被立即调用，组件第一次渲染完成之后不会调用该方法。

### componentWillUnmount()
```js
componentWillUnmount()
```
在组件卸载之前，`componentWillUnmount()`方法会被调用

### setState()
```js
setState(updater, [callback])
```
`setState()`方法告知React该组件以及其子组件需要用新的状态来重新渲染。为了提高性能，React将 setState 设置为批次更新，即是异步操作函数，并不能以顺序控制流的方式设置某些事件。

#### 完成回调
setState 函数的第二个参数允许传入回调函数，在状态更新完毕后进行调用。
```js
this.setState({
    load: !this.state.load,
    count: this.state.count + 1
}, () => {
    console.log(this.state.count);
    console.log('加载完成')
});
```

#### 传入状态计算函数
除了使用回调函数的方式监听状态更新结果之外，React还允许我们传入某个状态计算函数而不是对象来作为第一个参数。状态计算函数能够为我们提供可信赖的组件的State与Props值，即会自动地将我们的状态更新操作添加到队列中并等待前面的更新完毕后传入最新的状态值。
以简单的计数器为例，我们希望用户点击按钮之后将计数值连加两次:
```js
class Counter extends React.Component{
    constructor(props){
        super(props);
        this.state = {count : 0} 
        this.incrementCount = this.incrementCount.bind(this)
    }
    incrementCount(){
        // ...
    }
    render(){
        return <div>
                   <button onClick={this.incrementCount}>Increment</button>
                   {this.state.count}
               </div>
    }
}
```

为了说明异步更新带来的数据不可预测问题，我们可以连续两次调用setState函数：
```js
incrementCount(){
    this.setState({count : this.state.count + 1}) 
    this.setState({count : this.state.count + 1})
}
```
上述代码的效果是每次点击之后计数值只会加1，因为第二个setState并没有等待第一个setState执行完毕就开始执行了，因此其依赖的当前计数值完全是错的。

我们可以使用状态计算函数来保证数据的同步性：
```js
incrementCount(){
    this.setState((prevState, props) => ({
        count: prevState.count + 1
    }));
    this.setState((prevState, props) => ({
        count: prevState.count + 1
    }));
}
```

### forceUpdate()
```js
component.forceUpdate(callback)
```
如果`render()`方法从 this.props 或者 this.state 之外的地方读取数据，你需要通过调用 forceUpdate() 告诉 React 什么时候需要再次运行 render()。如果直接改变了 this.state，也需要调用 forceUpdate()。
调用 forceUpdate() 将会导致 render() 方法在相应的组件上被调用，并且会跳过`shouldComponentUpdate()`方法。另外，这也会触发子组件的生命周期函数，包括每个子组件的shouldComponentUpdate()。
通常情况下，应该尽量避免所有使用 forceUpdate() 的情况，在 render() 中仅从 this.props 和 this.state 中读取数据。这会使应用大大简化，并且更加高效。

## Class Properties
#### defaultProps
```js
class CustomButton extends React.Component {
    // ...
}

CustomButton.defaultProps = {
    color: 'blue'
};
```
```js
render() {
    return <CustomButton /> ; // props.color will be set to blue
}
```
```js
render() {
    return <CustomButton color={null} /> ; // props.color will remain null
}
```

## Instance Properties
#### props
#### state