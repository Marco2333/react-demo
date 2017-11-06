## React消息传递

在React中，数据流动是单向的(单向数据流)，父组件通过props将数据传递到子组件，子组件根据父组件传递来的属性和组件内部状态来确定如何渲染。因为单向数据流的特性，父组件向子组件传递数据是很容易的，即通过props传递数据，且子组件不能修改自己的props；父组件向孙子组件或者后代组件传递数据同样可以利用props进行层层传递。但是，开发过程中我们会遇到各种各样的情况，譬如子组件向父组件传递消息、兄弟组件之间传递消息等，下面我们看一下如何进行组件之间的消息传递。


### 父子组件之间进行消息传递
React是单向数据流的，父组件向子组件传递消息可以通过props进行传递：

```jsx
class Child extends React.Component {
    render() {
        console.log(this.props.value);  // 123
        return (
            <div>
                {this.props.value}
            </div>
        );
    }
}

class Parent extends React.Component {
    render() {
        return (
            <Child value="123" />
        );
    }
}

ReactDOM.render(<Parent />, document.getElementById('react-root'));
```

子组件向父组件传递消息也是通过props，因为在JavaScript中函数是`一等公民`，函数本身既可以像其他对象一样作为prop被传递到子组件，也可以在子组件中被直接调用。因此，我们可以向子组件传递一个`callback`，子组件通过调用这个`callback`来向父组件中传递数据。

```jsx
class Child extends React.Component {
    render() {
        console.log(this.props.value);
        return (
            <input onChange={this.props.handleChange}/>
        );
    }
}

class Parent extends React.Component {
    render() {
        return (
            <Child handleChange={(e) => {console.log(e.target.value)}} />
        );
    }
}

ReactDOM.render(<Parent/>, document.getElementById('react-root'));
```


### 兄弟组件之间进行消息传递
兄弟组件不能直接通过props进行消息传递，但是兄弟组件有相同的父元素，因此可以将需要传递的数据挂载在父组件中，由两个兄弟组件共享。父组件通过props将数据传递给两个子组件，如果某个组件需要改变数据并通知其兄弟组件，则通过父组件传递callback给子组件来实现。

```jsx
class Panel extends React.Component {
    render() {
        console.log(this.props.value);
        return (
            <div>{this.props.value}</div>
        );
    }
}

class Input extends React.Component {
    render() {
        return (
            <input onChange={this.props.handleChange}/>
        );
    }
}

class Parent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''
        }
    }

    render() {
        return (
            <div>
                <Panel value={this.state.value} />
                <Input handleChange={(e) => {this.setState({value: e.target.value})}} />
            </div>
        );
    }
}

ReactDOM.render(<Parent />, document.getElementById('react-root'));
```

上面这种方式耦合比较严重，父组件承担了本来与自己无关的功能。每次进行消息传递都会引发父组件不必要的生命周期，甚至影响其他子组件。如果消息传递比较频繁，会造成很大的浪费。

我们可以利用观察者模式(发布-订阅模式)实现兄弟组件之间的消息传递，需要利用eventProxy模块帮助实现消息传递功能：

```jsx
const eventProxy = new EventProxy();

class Child1 extends React.Component {
    render() {
        return (
            <div>
                <input onChange={(event) => {eventProxy.trigger('msg', event.target.value)}} />
            </div>
        );
    }
}

class Child2 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            msg: ''
        }
    }
    componentDidMount() {
        // 订阅者，监听并接收消息
        eventProxy.on('msg', (msg) => {this.setState({'msg': msg})});
    }

    render() {
        return (
            <div>
                Message from Child1: {this.state.msg}
            </div>
        );
    } 
}

const Parent = () => (
    <div>
        <Child1 />
        <Child2 />
    </div>
)

ReactDOM.render(<Parent/>, document.getElementById('react-root'));
```


### 父组件与后代节点之间进行消息传递
前面讲到父组件和子孙组件通信可以通过props层层传递，但是在一个嵌套多层的组件结构中，如果只有最里层的某个组件需要某个属性，该属性由最外层的组件提供(譬如redux中的`store`)，那么就要求中间的组件帮助层层传递该属性，即便这些中间组件不需要这个属性，也要添加对该属性的支持，这是一个很大的缺陷。

React提供了一个解决方案——`Context`(上下文)，它可以让一个树状组件都能访问一个共同的对象，但是需要上级组件和下级组件的配合。

上级组件需要宣称自己支持`context`(指定组件的`childContextTypes`属性)，并提供函数`getChildContext`来返回代表`Context`的对象；该组件的所有子孙组件只需宣称自己需要这个`context`，就可以通过`this.context`访问这个共同的环境对象--`context`。

```jsx
class Child extends React.Component {
    render() {
        return (
            <span>
                {this.context.VALUE}
            </span>
        )
    }
}

Child.contextTypes = {
    VALUE: React.PropTypes.number
}

const SubParent = (props) => {
    return (
        <div>
            <p>Title</p>
            {
                React.Children.map(props.children, (child) => {
                    return (
                        <li>
                            {child}
                        </li>
                    )
                })
            }
        </div>
    )
}

class Parent extends React.Component {
    getChildContext() {
        return {
            VALUE: 123
        }
    }

    render() {
        return (
            <div>
                <SubParent>
                    <Child />
                    <Child />
                </SubParent>
            </div>
        );
    }
}

Parent.childContextTypes = {
    VALUE: React.PropTypes.number
}

ReactDOM.render(<Parent />, document.getElementById('react-root'));
```

### Redux
为了能够更加清晰高效地管理React应用的数据，Facebook开源React的同时，也推出了Flux架构。Redux是Flux的一种优化实现，在Flux的"单向数据流"原则之上，Redux附加了另外三个原则：

- 唯一数据源
- 状态只读
- 数据改变只能通过纯函数完成

#### 唯一数据源
唯一数据源指应用的状态数据应该只存储在唯一的`Store`上(Redux没有禁止创建多个Store，而是认为多个Store不会带来好处)。

#### 保持状态只读
保持状态只读指不能直接修改状态，而是通过派发`action`的方式修改，这一点与`Flux`类似。

#### 数据改变只能通过纯函数完成
纯函数指`Reducer`：

```jsx
reducer(state, action)
```

`reducer`根据`state`和`action`的值产生一个新对象，作为新的state(对应模块下的新state)，而不是直接修改原来的state。`reducer`只负责计算新状态，而不负责存储状态。

```jsx
const reducer = (state = {}, action) => {
    switch(action.type) {
        case '1': {
            return {
                ...state,
                status: 1
            }
        }
        case '2': {
            return {
                ...state,
                status: 2
            }
        }
        case '3': {
            return {
                ...state,
                status: 3
            }
        }
        default: {
            return state
        }
    }
}
```

下面这张图诠释了Redux的作用：
![](https://github.com/Marco2333/react-demo/blob/master/demo/images/demo11_1.jpg)

关于Redux的使用可以看这里：[Redux官网](http://redux.js.org/)