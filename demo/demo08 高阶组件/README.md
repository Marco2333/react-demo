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

如果高阶组件要做的事情不涉及除了`render`之外的生命周期函数，也不需要维护自己的状态，那么可以直接返回一个纯函数。

```jsx
function removeUserProp(WrappedComponent) {
	return function newRender(props) {
		const {user, ...otherProps} = props;
		return <WrappedComponent {...otherProps} />
	}
}
```