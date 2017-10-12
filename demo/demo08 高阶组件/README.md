# React高阶组件

高阶组件(Higher Order Component，HOC)是React的一种模式，用于增强现有组件的功能。
简单来说，一个高阶组件就是一个函数，这个函数接受一个组件作为输入，并返回一个新组件作为输出。返回的新组件拥有输入组件不具有的功能。

#### 高阶组件的意义：
- 重用代码。利用高阶组件提取公共逻辑，减少重复代码。
- 修改现有React组件的行为。对于某些第三方组件，我们不想触碰其内部逻辑，可以通过独立于原有组件的函数，产生新的组件并且对原组件没有侵害。

根据返回的新组件和传入组件参数的关系，高阶组件的实现方式可以分为两大类：
- 代理方式的高阶组件
- 继承方式的高阶组件

### 代理方式的高阶组件
特点：返回的新组件类直接继承自`React.Component`。新组件扮演的角色是参数组件的`代理`。

```jsx
function removeUserProp(WrappedComponent) {
	return class NewComponent extends WrappedComponent {
		render() {
			const elements = super.render();
			const {user, ...otherProps} = this.props;

			console.log('##', elements);

			return React.cloneElement(elements, otherProps, elements.props.children);
		}
	};
}
```

如果高阶组件要做的事情不涉及除了`render`之外的生命周期函数，也不需要维护自己的状态，那么可以直接返回一个纯函数。

```jsx
function removeUserProp(WrappedComponent) {
	return function newRender(props) {
		const {user, ...otherProps} = props;
		return <WrappedComponent {...otherProps} />
	}
}
```

代理方式的高阶组件应用场景：
- 操纵 props
- 访问 ref
- 抽取状态
- 包装组件

#### 操纵props
代理类型高阶组件返回的新组件，渲染过程也被新组件的`render`函数控制。我们可以增删、修改传递给被包裹组件的`props`，来实现新的功能，也可以将props原封不动地传递给被包裹组件。

```jsx
const addNewProps = (WrappedComponent, newProps) => {
	return class WrappingComponent extends React.Component {
		render() {
			return <WrappedComponent {...this.props} {...newProps} />
		}
	}
}
```

#### 访问ref
访问`ref`的原理其实也是增加传递给被包裹组件的props，只是利用了`ref`这个特殊的prop。这样我们通过`ref`获得了被包裹组件实例的引用，可以直接操纵实例。但是React不推荐使用`ref`直接访问组件。所以，我们最好使用受控组件(Controlled Component)来代替`ref`。

```jsx
const refsHOC = (WrappedComponent) => {
	return class HOCComponent extends React.Component {
		constructor() {
			super(...arguments);

			this.linkRef = this.linkRef.bind(this);
		}

		linkRef(wrappedInstance) {
			this._root = wrappedInstance;
		}

		render() {
			const props = {...this.props, ref: this.linkRef};

			return <WrappedComponent {...props}/>;
		}
	};
};
```

#### 抽取状态
在`react-redux`中的`connect`函数就是用到了高阶组件的抽取状态功能。注意，`connect`函数本身并不是高阶组件，其执行结果才是高阶组件。
在傻瓜组件与容器组件的关系中，通常将傻瓜组件作为无状态组件，而由容器组件来管理所有状态，这个模式就是`抽取状态`。

`connect`代码结构如下：
```jsx
function connect(mapStateToProps = doNothing, mapDispatchToProps = doNothing) {
	return function(WrappedComponent) {
		class HOCComponent extends React.Component {
		
		};

		HOCComponent.contextTypes = {
			store: React.PropTypes.object
		}

		return HOCComponent;
	};
}
```

和`react-redux`中的`connect`一样，上面的connect方法接受两个参数。返回的组件类能访问`context`中`store`的值，在`react-redux`中，其值由`Provider`提供。
接下来，`HOCComponent`需要一系列生命周期函数来维持内部状态和`store`的同步：

```jsx
constructor() {
	super(...arguments);

	this.onChange = this.onChange.bind(this);
}

componentDidMount() {
	this.context.store.subscribe(this.onChange);
}

componentWillUnmount() {
	this.context.store.unsubscribe(this.onChange);
}

onChange() {
	this.setState({});
}
```

通过`store`上的`subscribe`和`unsubscribe`函数，保证了`Redux`上`store`更新时，`HOCComponent`组件会重新渲染。

HOCComponent `render`函数如下：

```jsx
render() {
	const store = this.context.store;
	const newProps = {
		...this.props,
		...mapStateToProps(store.getState(), this.props),
		...mapDispatchToProps(store.dispatch, this.props)
	}

	return <WrappedComponent {...newProps} />;
}
```

添加`shouldComponentUpdate`：
```jsx
shouldComponentUpdate(nextProps, nextState) {
	for (const propType in nextProps) {
		if (nextProps.hasOwnProperty(propType)) {
			if (nextProps[propType] === this.props[propType]) {
				return true;
			}
		}
	}

	for (const propType in this.props) {
		if (this.props.hasOwnProperty(propType)) {
			if (nextProps[propType] === this.props[propType]) {
				return true;
			}
		}
	}

	return false;
}
```

至此，我们实现了一个相对完成的`connect`函数：

```jsx
function connect(mapStateToProps = doNothing, mapDispatchToProps = doNothing) {
	return function(WrappedComponent) {
		class HOCComponent extends React.Component {
			constructor() {
				super(...arguments);

				this.onChange = this.onChange.bind(this);
			}

			shouldComponentUpdate(nextProps, nextState) {
				for (const propType in nextProps) {
					if (nextProps.hasOwnProperty(propType)) {
						if (nextProps[propType] === this.props[propType]) {
							return true;
						}
					}
				}

				for (const propType in this.props) {
					if (this.props.hasOwnProperty(propType)) {
						if (nextProps[propType] === this.props[propType]) {
							return true;
						}
					}
				}

				return false;
			}

			componentDidMount() {
				this.context.store.subscribe(this.onChange);
			}

			componentWillUnmount() {
				this.context.store.unsubscribe(this.onChange);
			}

			onChange() {
				this.setState({});
			}

			render() {
				const store = this.context.store;
				const newProps = {
					...this.props,
					...mapStateToProps(store.getState(), this.props),
					...mapDispatchToProps(store.dispatch, this.props)
				}

				return <WrappedComponent {...newProps} />;
			}
		};

		HOCComponent.contextTypes = {
			store: React.PropTypes.object
		}

		HOCComponent.displayName = `Connect(${getDisplayName(WrappedComponent)})`;

		return HOCComponent;
	};
}
```

#### 包装组件
除了操纵`props`、`state`、`ref`等，我们还可以通过高阶组件在render函数中引入其它元素，甚至组合多个React组件。

```jsx
const styleHOC = (WrappedComponent, style) => {
	return class HOCComponent extends React.Component {
		render() {
			return (
				<div style={style}>
					<WrappedComponent {...this.props}/>
				</div>
			);
		}
	};
};
```


### 继承方式的高阶组件
继承方式的高阶组件采用继承关系关联参数组件和返回的新组件。

```jsx
function removeUserProp(WrappedComponent) {
	return class NewComponent extends WrappedComponent {
		render() {
			const {user, ...otherProps} = this.props;
			this.props = otherProps;
			return super.render();
		}
	};
}
```

##### 需要注意：在代理方式下`WrappedComponent`经历了一个完整的生命周期，但是在继承方式下`super.render()`只是生命周期中的一个函数。在代理方式下产生的新组件和参数组件是不同的两个组件，一次渲染，两个组件都要经历各自的生命周期。在继承方式下两者合二为一，只有一个生命周期。

继承方式高阶组件的应用场景：
- 操纵props
- 操纵state
- 渲染劫持

#### 操纵props
除了上面直接修改props(不安全)的方式，还可以利用`React.cloneElement`。

```jsx
function removeUserProp(WrappedComponent) {
	return class NewComponent extends WrappedComponent {
		render() {
			const elements = super.render();
			const {user, ...otherProps} = this.props;

			console.log('##', elements);

			return React.cloneElement(elements, otherProps, elements.props.children);
		}
	};
}
```

继承方式操纵props比较复杂，除了高阶组件需要根据参数组件渲染结果来决定如何修改props这种情况，不建议使用。

#### 操纵state
因为继承方式返回的新组件可以操作`WrappedComponent`实例的state，但是随意修改参数组件的state，可能会造成意想不到的错误，不建议使用。

```jsx
function debugState(WrappedComponent) {
	return class NewComponent extends WrappedComponent {
		render() {
			<div>
				<h2>HOC Debugger Component</h2>
				<p>State</p><pre>{JSON.stringify(this.state)}</pre>
				{
					super.render()
				}
			</div>
		}
	};
}
```

#### 渲染劫持
因为继承方式返回的新组件继承了参数组件，所以可以重定义任何一个React组件的生命周期函数。

##### 条件渲染
```jsx
const onlyForLoggedInHOC = (WrappedComponent) => {
	return class NewComponent extends WrappedComponent {
		render() {
			if (this.props.loggedIn) {
				return super.render();
			} else {
				return null;
			}
		}
	}
}
```

```jsx
const cacheHOC = (WrappedComponent) => {
	return class NewComponent extends WrappedComponent {
		shouldComponentUpdate(nextProps, nextState) {
			return !nextProps.useCache;
		}
	}
}
```

#### 代理方式、继承方式选择准则：优先考虑代理方式，其次继承方式

### 高阶组件显示名称
每个高阶组件都会产生一个新的组件，这个新组件丢掉了参数组件的“显示名”，为了方便开发和维护，往往需要给高阶组件重新定义“显示名”，方便debug或在日志文件中查看。我们可以通过组件的`displayName`来设置“显示名”。
以`react-redux`中的`connect`为例：

```jsx
function getDisplayName(WrappedComponent) {
	return WrappedComponent.displayName ||
	WrappedComponent.name ||
	'Component';
}

HOCComponent.displayName = `Connect(${getDisplayName(WrappedComponent)})`;
```


### 以函数为子组件
高阶组件可以实现代码重用，在不损害原组件的情况下修改组件的功能。但是，高阶组件也有局限性。它固化了对参数组件的要求。如果一个高阶组件要作用于某个组件，那么这个组件就必须能够接受高阶组件传过来的`props`，如果组件不支持高阶组件传过来的props，或者props的命名方式或使用方式不同，那么就没办法应用高阶组件作用于此组件。

“以函数为子组件”的模式就是为了克服这种局限性而产生的。这种模式下，实现代码重用的是一个真正的React组件，而不是一个函数，并且该组件要求子组件必须为一个函数。该组件的`render`函数会直接把`this.props.children`当做函数来调用。

```jsx
const loggedInUser = 'mock user';

class AddUserProp extends React.Component {
	render() {
		const user = loggedInUser;
		return this.props.children(user)
	}
}

AddUserProp.propTypes = {
	children: React.PropTypes.func.isRequired
}
```

`AddUserProp`的灵活之处在于它没有对被增强组件有任何props要求，只是将一个参数传递过去，而使用方式完全由子组件决定。

```jsx
<AddUserProp>
{
	(user) => <div>{user}</div>
}
<AddUserProp/>
```
```jsx
<AddUserProp>
{
	(user) => <Foo currentUser={user} />
}
<AddUserProp/>
```

实例CountDown: 
```jsx
class CountDown extends React.Component {

	constructor() {
		super(...arguments);

		this.state = {count: this.props.startCount};
	}

	shouldComponentUpdate(nextProps, nextState) {
		return nextState.count !== this.state.count;
	}

	componentDidMount() {
		this.intervalHandle = setInterval(() => {
			const newCount = this.state.count - 1;
			if (newCount >= 0) {
				this.setState({count: newCount});
			} else {
				window.clearInterval(this.intervalHandle);
				this.intervalHandle = null;
			}
		}, 1000);
	}

	componentWillUnmount() {
		if (this.intervalHandle) {
			window.clearInterval(this.intervalHandle);
			this.intervalHandle = null;
		}
	}

	render() {
		return this.props.children(this.state.count);
	}
}

CountDown.propTypes = {
	children: React.PropTypes.func.isRequired,
	startCount: React.PropTypes.number.isRequired
}
```
```jsx
<CountDown startCount={10}>
{
	(count) => <div>{count}</div>
}
<CountDown/>
```

#### 性能优化问题
“以函数为子组件”模式可以让代码变得很灵活，但是针对这种模式我们很难做性能优化。因为每次渲染都需要调用函数来获得实际渲染结果，而我们又很难通过`shouldComponentUpdate`来优化。
```jsx
<CountDown startCount={10}>
{
	(count) => <div>{count}</div>
}
<CountDown/>
```

每次渲染都会重新定义一个新的函数，那么`shouldComponentUpdate`无法判断函数子组件是否完成相同的功能。
我们可以这样改写函数子组件：

```jsx
showCount(count) {
	return <div>{count}</div>
}
```
```jsx
<CountDown startCount={10}>
{
	showCount
}
<CountDown/>
```

但是这样失去了代码的灵活性，所以我们需要根据自己的需求来权衡。

#### reference：《深入浅出React和Redux》