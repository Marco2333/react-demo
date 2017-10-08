# 受控组件与非受控组件
React 通过`props`和`state`来区分组件的属性和状态。其中，props(属性)用来表示组件外部传入的属性，组件内部不能改变。而state(状态)通常表示组件内部的状态，状态是可以并且应该改变的。React通过 `props`和`state`的值来渲染组件，组件渲染完毕之后，通过响应用户操作或者异步网络请求等操作更新组件的状态来重新渲染组件。

**注意：state中存放的应该是与组件渲染相关的并且会发生变化的属性，对于一些与渲染无关的组件内部的属性（譬如组件内部生成的 setTimeout 句柄），不应该存放在state中（可以存为实例属性）。**

那么什么是`受控组件`与`非受控组件`呢？
我们知道 React 通过 state 来存放组件的内部状态，但是当我们使用原生HTML表单元素（例如input、textarea等）时，我们是否应该将表单元素的值存放到state中呢？

### 受控组件(Controlled Component)
将表单数据统一存放在 state 中，交由 React 管理。

```jsx
class ControlledForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: ''
		}
		this.handleSubmit = this.handleSubmit.bind(this);
		this.updateUsername = this.updateUsername.bind(this);
	}

	updateUsername(e) {
		this.setState({
			username: e.target.value,
		})
	}

	handleSubmit() {}

	render () {
		return (
			<form onSubmit={this.handleSubmit}>
				<input
					type='text'
					value={this.state.username}
					onChange={this.updateUsername} />
				<button type='submit'>Submit</button>
			</form>
		)
	}
}
ReactDOM.render(<ControlledForm />, document.getElementById('react-root'))
```

受控组件将表单数据统一存放在 state 中，这意味着数据和UI是同步的，React 通过存放的表单数据来渲染UI。这样我们就可以根据用户的输入及时作出响应：
- 验证输入正确性（输入格式、类型等），并作出反馈
- 根据输入设置其它组件的状态，譬如输入不规范时，提交按钮处于不可用状态

### 非受控组件(Uncontrolled Component)
和传统的表单数据管理一样，由DOM存放表单数据，可以使用React提供的`refs`来获得DOM元素的引用。

```jsx
class UnControlledForm extends React.Component {
	constructor(props) {
		super(props);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleSubmit(e) {
		e.preventDefault();
		console.log("Value: ", this.input.value)
	}

	render () {
		return (
			<form onSubmit={this.handleSubmit}>
			<input
				type='text'
				ref={(input) => this.input = input} />
			<button type='submit'>Submit</button>
			</form>
		)
	}
}
ReactDOM.render(<UnControlledForm />, document.getElementById('react-root'));
```
非受控组件是一种相对简单的方式，在需要的时候（譬如表单提交的时候）一次性获取表单的值。

### 表单元素
| 表单元素            | Value property    |  Change callback  |  New value in the callback |
|----- | -----:| -----:| :----: |
| \<input type="text" /> | value="string"  |  onChange | event.target.value |
| \<input type="checkbox" /> | checked={boolean} |  onChange  | event.target.checked |
| \<input type="radio" /> | checked={boolean} |   onChange    | event.target.checked |
| \<select /> | value="option value"  |  onChange   | event.target.value |
| \<textarea /> | value="string"  |   onChange    | event.target.value |


### 受控组件 VS. 非受控组件
受控组件与非受控组件各有优劣，需要具体问题具体分析。当我们需要对用户输入进行控制或者根据用户输入作出相应响应的时候，我们需要使用受控组件；如果我们需要的表单很简单，只需要最后进行一次简单的验证或者只依赖UI反馈，那么我们可以使用带refs的非受控组件。

| 特点 | 非受控组件 |  受控组件  |
|----- | -----:| :-----:|
| one-time value retrieval | √ | √ |
| validating on submit | √ | √ |
| instant field validation | × | √ |
| conditionally disabling submit button | × | √ |
| enforcing input format | × | √ |
| several inputs for one piece of data | × | √ |
| dynamic inputs | × | √ |