# React setState 详解

React 通过`setState`方法来更新组件的内部状态，当`setState`方法被调用时，React 会根据新的state来重新渲染组件（并不是每次`setState`都会触发render，React可能会合并操作，再一次性 render）。

### setState异步更新状态(不保证同步更新状态)
React 组件的`setState`方法是通过队列机制来实现state(状态)更新的。当`this.setState(newState)`被调用时，React不会立即更新`this.state`的值，而是将`newState`放入待更新队列，批次更新，这样做的目的是提高性能，避免频繁重新渲染。
```jsx
class StateTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0
        }
    }
 
    componentDidMount() {
        this.setState({
            count: this.state.count + 1
        });
        console.log(this.state.count); // 0
    }
     
 
    render () {
        return (
            <div></div>
        )
    }
}
 
ReactDOM.render(<StateTest />, document.getElementById('react-root'));
```

### setState同步更新策略
上面提到为了提高性能，React将`setState`设置为批次更新，从而避免了频繁地重新渲染组件，即`setState`是不能保证同步更新状态的。因此，如果我们在`setState`之后，直接使用`this.state.key`很可能得到错误的结果。那么当我们需要同步获得 state 更新后的值时，如何做呢？React提供了两种方式来实现该功能。

#### 完成回调
setState方法可以传入第二个函数类型的参数作为回调函数，该回调函数将会在state完成更新之后被调用。
```jsx
class StateTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0
        }
    }
 
    componentDidMount() {
        this.setState({
            count: this.state.count + 1
        }, () => {
            console.log(this.state.count); // 1
        });
        console.log(this.state.count); // 0
    }
     
 
    render () {
        return (
            <div></div>
        )
    }
}
```

#### 状态计算函数
除了使用回调函数之外，React 还提供了另一种实现state同步更新的策略。React 允许我们将函数作为setState()的第一个参数，该函数作为状态计算函数将被传入两个参数，可信赖的组件`state`和组件`props`。React会自动将我们的状态更新操作添加到队列中并等待前面的状态更新完毕，最后将最新的`state`传入状态计算函数。
```jsx
class StateTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0
        }
    }
 
    componentDidMount() {
        this.setState({
            count: this.state.count + 1
        });
 
        this.setState({
            count: this.state.count + 1
        }, () => {
            console.log(this.state.count); // 1
        });
    }
     
    render () {
        return (
            <div></div>
        )
    }
}
```
```jsx
class StateTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            count: 0
        }
    }
 
    componentDidMount() {
        this.setState((prevState, props) => ({
            count: prevState.count + 1
        }));
 
        this.setState((prevState, props) => ({
            count: prevState.count + 1
        }), () => {
            console.log(this.state.count); // 2
        });
    }
     
 
    render () {
        return (
            <div></div>
        )
    }
}
```

### setState注意事项
下面我们说一下 setState 使用的几点注意事项： 
- setState 循环调用风险
- setState 可能会引发不必要的渲染
- setState 并不总能有效地管理组件中的所有状态

#### setState循环调用风险
调用`setState`之后，shouldComponentUpdate、componentWillUpdate、render、componentDidUpdate 等生命周期函数会依次被调用（如果`shouldComponentUpdate`没有返回 false的话），如果我们在`render`、`componentWillUpdate`或`componentDidUpdate`中调用了`setState`方法，那么可能会造成循环调用，最终导致浏览器内存占满后崩溃。

#### setState可能会引发不必要的渲染
按照React的设计，setState 的调用会触发组件的重新渲染，但是很多时候重新渲染是没有必要的，不必要的重新渲染会造成性能损失。

##### 可能造成不必要渲染的因素如下： 
- 新 state 和之前的一样。这种情况可以通过 shouldComponentUpdate 解决。
- state 中的某些属性和视图没有关系（譬如事件、timer ID等），这些属性改变不影响视图的显示。

#### setState并不总能有效地管理组件中的所有状态
基于上面提到的，因为组件中的某些属性是和视图没有关系的，所以如果使用`setState`来更新这些属性会造成不必要的浪费。当组件变得复杂的时候可能会出现各种各样的状态需要管理，这时候用`setState`管理所有状态是不可取的。

state中本应该只保存与渲染有关的状态，而与渲染无关的状态尽量不放在`state`中管理，可以直接保存为组件实例的属性，这样在属性改变的时候，不会触发渲染，避免浪费。

### 一道经典的题目
关于 setState 的源码分析以及题目详解，看[这里](https://zhuanlan.zhihu.com/p/20328570)，这里简单讲一下。
```jsx
class StateTest1 extends React.Component {
    constructor() {
        super();
        this.state = {
            count: 0
        };
    }
 
    componentDidMount() {
        this.setState({
            count: this.state.count + 1
        });
        console.log(this.state.count);    // 0
 
        this.setState({
            count: this.state.count + 1
        });
        console.log(this.state.count);    // 0
 
        setTimeout(() => {
            this.setState({
                count: this.state.count + 1
            });
            console.log(this.state.count);  // 2
 
            this.setState({
                count: this.state.count + 1
            });
            console.log(this.state.count);  // 3
        }, 0);
    }
 
    render() {
        return null;
    }
};
```
#### setState干了什么
![](https://github.com/Marco2333/react-demo/blob/master/demo/demo07%20setState/1.png)

上面这个流程图是一个简化的 setState 调用栈，其中核心的状态判断源代码如下：
```jsx
function enqueueUpdate(component) {
    // ...
 
    if (!batchingStrategy.isBatchingUpdates) {
        batchingStrategy.batchedUpdates(enqueueUpdate, component);
        return;
    }
 
    dirtyComponents.push(component);
}
```
若`isBatchingUpdates`为 true，则把当前组件（即调用了 setState 的组件）放入`dirtyComponents`数组中；否则`batchUpdate`所有队列中的更新。

其中，`batchingStrategy`为一个简单的对象，定义如下：
```jsx
var batchingStrategy = {
    isBatchingUpdates: false,
 
    batchedUpdates: function(callback, a, b, c, d, e) {
        // ...
        batchingStrategy.isBatchingUpdates = true;
         
        transaction.perform(callback, null, a, b, c, d, e);
    }
};
```

*分析*
前两次在`componentDidMount`中调用`setState`时，已经处于`batchedUpdates`执行的`transaction`中，`batchingStrategy`的`isBatchingUpdates`已经被设为true，所以两次`setState`的结果并没有立即生效，而是被放进了`dirtyComponents`中。所以前两次打印this.state.val都是0，新的`state`还没有被应用到组件中。

而`setTimeout`中的两次`setState`是异步的，所以没有立即执行。`componentDidMount`运行结束，`transaction`也会运行并结束，`transaction`结束时会触发`closeAll`函数，这个函数会将`isBatchingUpdates`重新给设置会初始状态false。当`setTimeout`中的`setState`执行时，因为没有前置的`batchedUpdate`调用，所以`batchingStrategy`的`isBatchingUpdates`标志位是false，也就导致了新的`state`马上生效，没有走到`dirtyComponents`分支。

综上:`setState`并不总是异步执行的。当没有前置`batchedUpdate`时，`setState`中的新状态是会立刻生效的，而不是放到`dirtyComponents`中等待更新。

### 总结
- 调用 setState 之后，React 会将传入的参数对象与组件当前的状态合并作为组件新的状态，然后触发调和过程。经过调和过程，React会以相对高效的方式根据新的状态构建新的 Virtual DOM，通过对比新旧虚拟DOM的差异，最小限度的修改DOM，更新UI。
- 然而， setState 更新状态并不能保证是同步的，在使用的时候需要注意，避免造成不必要的错误。同时，React也提供了同步更新的策略，在需要的时候，满足我们的需求。
- 需要注意的是，setState 并不总能有效的管理组件状态，因为一些与渲染无关的状态的更新会造成UI不必须要的渲染，我们的原则是，state 中只保存与UI相关的状态，而其他的可以存为实例属性。
- 另外，需要注意 setState 调用之后触发的触发周期函数，如果在这些函数中调用 setState，可能会造成循环调用，导致浏览器内存占满后崩溃。