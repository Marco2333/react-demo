## React消息传递

在React中，数据流动是单向的(单向数据流)，父组件通过props将数据传递到子组件，子组件根据父组件传递来的属性和组件内部状态来确定如何渲染。因为单向数据流的特性，父组件向子组件传递数据是很容易的，即通过props向子组件传递数据，且子组件不能修改自己的props；同样，父组件向孙子组件或者后代组件传递数据同样可以利用props进行层层传递。但是，开发过程中我们会遇到各种各样的情况，譬如子组件向父组件传递消息，兄弟组件之间传递消息等，下面我们看一下如何进行组件之间的消息传递。


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

ReactDOM.render(<Parent/>, document.getElementById('react-root'));
```


### 父组件与后代节点之间进行消息传递