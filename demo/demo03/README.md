# React组件生命周期
基本上所有React组件生命周期方法可以分为下面三个阶段：
- 挂在(Mounting)：这个阶段发生在组件被创建并被插入到DOM时
- 更新(Updating)：这个阶段发生在组件被重新渲染成虚拟DOM并决定实际DOM是否需要更新时
- 卸载(Unmounting)：这个阶段发生在组件从DOM中被删除时

## 组件挂载阶段
ES5(React.createClas)
- getInitialState()
- componentWillMount()
- render()
- componentDidMount()

ES6(React.Component)
- constructor()
- componentWillMount()
- render()
- componentDidMount()

## 组件更新阶段
ES5/ES6
- componentWillReceiveProps()
- shouldComponentUpdate()
- componentWillUpdate()
- render()
- componentDidUpdate()

## 组件卸载阶段
ES5/ES6
- componentWillUnmount()
