# 创建第一个React组件

可以通过三种方式创建React组件：
- 无状态函数式组件
- React.createClass
- React.Component

## 无状态函数式组件
官方指出：`在大部分React组件中，大部分组件被写成无状态组件，通过简单组合可以构建成其他的组件；这种通过创建多个简单组件然后合并成一个大应用的设计模式被提倡。`

无状态函数式组件形式上表现为只带有一个`render`方法的组件类，通过函数形式或者ES6 arrow function的形式创建，并且该组件是无`state`状态的。

```jsx
function HelloComponent(props) {
	return <div> Hello {props.name} </div>;
}

ReactDOM.render(<HelloComponent name="root" />, document.getElementById('react-root')) 
```

无状态组件的特点：
	- 可读性好，并且减少了冗余代码，精简至只有一个render方法
	- 组件不会被实例化，不需要分配多余的内存,整体渲染性能提高
	- 组件不能访问this对象;无状态组件由于没有实例化过程，所以无法访问组件this中的对象
	- 组件无法访问生命周期的方法;因为无状态组件是不需要组件生命周期管理和状态管理，所以底层实现这种形式的组件时是不会实现组件的生命周期方法。
	- 组件只能访问输入的props，同样的props会得到同样的渲染结果，不会有副作用

无状态组件被鼓励在大型项目中尽可能以简单的写法来分割原本庞大的组件，未来React也会在这种面向无状态组件在譬如无意义的检查和内存分配领域进行一系列优化，所以只要有可能，尽量使用无状态组件。

## React.createClass

`React.createClass`是react刚开始推荐的创建组件的方式，这是ES5的原生的JavaScript来实现的React组件，其形式如下：

```jsx
var InputControlES5 = React.createClass({
	propTypes: {//定义传入props中的属性各种类型
		initialValue: React.PropTypes.string
	},
	defaultProps: { //组件默认的props对象
		initialValue: ''
	},
	// 设置 initial state
	getInitialState: function() {//组件相关的状态对象
		return {
			text: this.props.initialValue || 'placeholder'
		};
	},
	handleChange: function(event) {
		this.setState({ //this represents react component instance
			text: event.target.value
		});
	},
	render: function() {
		return (
			<div>
				Type something:
				<input onChange={this.handleChange} value={this.state.text} />
			</div>
		);
	}
});
```

与无状态组件相比，React.createClass和后面要描述的React.Component都是创建有状态的组件，这些组件是要被实例化的，并且可以访问组件的生命周期方法。但是随着React的发展，React.createClass形式自身的问题暴露出来：
- React.createClass会自绑定函数方法（不像React.Component只绑定需要关心的函数）导致不必要的性能开销，增加代码过时的可能性。
- React.createClass的mixins不够自然、直观，React.Component形式非常适合高阶组件（Higher Order Components--HOC）,它以更直观的形式展示了比mixins更强大的功能，并且HOC是纯净的JavaScript，不用担心他们会被废弃。

## React.Component

React.Component是以ES6的形式来创建react的组件的，是React目前极为推荐的创建有状态组件的方式，最终会取代React.createClass形式；相对于 React.createClass可以更好实现代码复用。将上面React.createClass的形式改为React.Component形式如下：

```jsx
class InputControlES6 extends React.Component {
	constructor(props) {
		super(props);

		// 设置 initial state
		this.state = {
			text: props.initialValue || 'placeholder'
		};

		// ES6 类中函数必须手动绑定
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(event) {
		this.setState({
			text: event.target.value
		});
	}

	render() {
		return (
			<div>
				Type something:
				<input onChange={this.handleChange}
			   value={this.state.text} />
			</div>
		);
	}
}

InputControlES6.propTypes = {
	initialValue: React.PropTypes.string
};
InputControlES6.defaultProps = {
	initialValue: ''
};
```

## React.createClass与React.Component区别

### 函数this绑定
`React.createClass` 创建的组件，其每一个成员函数的this都有React自动绑定，任何时候，直接使用`this.method`即可，函数中的`this`会被正确设置。

```jsx
const Contacts = React.createClass({  
	handleClick() {
		console.log(this); // React Component instance
	},
	render() {
		return (
			<div onClick={this.handleClick}></div>
		);
	}
});
```

React.Component创建的组件，其成员函数不会自动绑定this，需要开发者手动绑定，否则将它作为事件处理函数被调用时不能通过`this`获取当前组件实例对象。

```jsx
class Contacts extends React.Component {  
	constructor(props) {
		super(props);
	}
	handleClick() {
		console.log(this); // null
	}
	render() {
		return (
		  <div onClick={this.handleClick}></div>
		);
	}
}
```

`React.Component` 有三种手动绑定方法：
- 在构造函数中完成绑定
- 调用时使用method.bind(this)来完成绑定
- 使用arrow function 来绑定

```jsx
constructor(props) {
	super(props);
	this.handleClick = this.handleClick.bind(this); //构造函数中绑定
}

<div onClick={this.handleClick.bind(this)}></div> //使用bind来绑定

<div onClick={()=>this.handleClick()}></div> //使用arrow function来绑定
```

### 组件属性类型 propTypes 及其默认 props 属性 defaultProps 配置不同

`React.createClass`在创建组件时，有关组件props的属性类型及组件默认的属性会作为组件实例的属性来配置;defaultProps是使用`getDefaultProps`方法来获取默认组件属性的

```jsx
const TodoItem = React.createClass({
	propTypes: { // as an object
		name: React.PropTypes.string
	},
	getDefaultProps(){   // return a object
		return {
			name: ''	
		}
	}
	render(){
		return <div></div>
	}
})
```

React.Component在创建组件时配置这两个对应信息时，他们是作为组件类的属性，不是组件实例的属性，也就是所谓的类的静态属性来配置的:

```jsx
class TodoItem extends React.Component {
	static propTypes = {//类的静态属性
		name: React.PropTypes.string
	};

	static defaultProps = {//类的静态属性
		name: ''
	};
}
```

### 组件初始状态state配置不同

- `React.createClass`创建的组件，其状态state是通过`getInitState`方法方法来配置组件的相关状态
- `React.Component`创建的组件，其状态state是在`construct`中像初始化组件属性一样声明

```jsx
const TodoItem = React.createClass({
	// return an object
	getInitialState(){ 
		return {
			isEditing: false
		}
	}
	render(){
		return <div></div>
	}
})
```

```js
class TodoItem extends React.Component{
	constructor(props) {
		super(props);
		this.state = { // define this.state in constructor
			isEditing: false
		} 
	}

	render() {
		return <div></div>
	}
}
```

### Mixins的支持不同
`Mixins`(混入)是面向对象编程OOP的一种实现，其作用是为了复用共有的代码，将共有的代码通过抽取为一个对象，然后通过Mixins进该对象来达到代码复用

`React.createClass`在创建组件时可以使用`mixins`属性，以数组的形式来混合类的集合。

```jsx
var SomeMixin = {  
	doSomething() {

	}
};
const Contacts = React.createClass({  
	mixins: [SomeMixin],
	handleClick() {
		this.doSomething(); // use mixin
	},
	render() {
		return (
			<div onClick={this.handleClick}></div>
		);
	}
});
```

`React.Component`不支持Mixins,React开发者社区提供了一个全新的方式来取代Mixins，那就是Higher-Order Components(高阶组件)

## 该选择哪种方式创建组件
由于React团队已经声明React.createClass最终会被React.Component的类形式所取代。但是在找到Mixins替代方案之前是不会废弃掉`React.createClass`形式。所以：
`能用React.Component创建的组件的就尽量不用React.createClass形式创建组件。`

另外，创建组件的形式选择还应该根据以下准则来决定：
`
- 只要有可能，尽量使用无状态组件创建形式。
- 否则（如需要state、生命周期方法等），使用`React.Component`这种es6形式创建组件
`

参考地址：[http://www.cnblogs.com/wonyun/p/5930333.html](http://www.cnblogs.com/wonyun/p/5930333.html)