## React事件系统

### 简介

原生DOM事件体系存在很多问题，譬如各浏览器之间存在差异、容易引起内存浪费、性能低下、JS操作DOM效率低等。为了解决这些问题，React实现了一套比较高效的事件合成系统，包括事件注册、存储、分发、重用等功能。
与原生DOM事件体系相比，React事件合成系统有如下特点：
- 事件委托技术
- 事件冒泡机制
- 合成事件
- 事件池

#### 事件委托技术
在React组件上声明的事件最终都转化为原生事件并绑定到`document`上，而不是React组件对应的`DOM节点`。所以只有document节点绑定了原生事件。这样简化了事件体系，减少了内存开销。

#### 事件冒泡机制
原生DOM事件体系`“DOM2级事件”`规定的事件流包括三个阶段: 事件捕获阶段、处于目标阶段和事件冒泡阶段。而React自身实现了一套事件冒泡机制，以队列的方式，从触发事件的组件向父组件回溯，调用在组件上绑定的事件处理函数。

#### 合成事件
React在原生`event`基础上做了一层跨浏览器的封装 -- `SyntheticEvent(合成事件)`，`SyntheticEvent`与原生`event`拥有相同的接口，包括stopPropagation()和preventDefault()。在组件上定义的事件处理函数将会被传入SyntheticEvent的实例。我们可以通过`nativeEvent`属性来访问原生的浏览器event对象。

#### 事件池
React使用对象池来管理合成事件对象的创建和销毁，这样减少了垃圾的生成和新对象内存的分配，大大提高了性能。

### React事件系统

先看 Facebook 给出的React事件系统框图

```
 * +------------+    .
 * |    DOM     |    .
 * +------------+    .
 *       |           .
 *       v           .
 * +------------+    .
 * | ReactEvent |    .
 * |  Listener  |    .
 * +------------+    .                         +-----------+
 *       |           .               +--------+|SimpleEvent|
 *       |           .               |         |Plugin     |
 * +-----|------+    .               v         +-----------+
 * |     |      |    .    +--------------+                    +------------+
 * |     +-----------.--->|EventPluginHub|                    |    Event   |
 * |            |    .    |              |     +-----------+  | Propagators|
 * | ReactEvent |    .    |              |     |TapEvent   |  |------------|
 * |  Emitter   |    .    |              |<---+|Plugin     |  |other plugin|
 * |            |    .    |              |     +-----------+  |  utilities |
 * |     +-----------.--->|              |                    +------------+
 * |     |      |    .    +--------------+
 * +-----|------+    .                ^        +-----------+
 *       |           .                |        |Enter/Leave|
 *       +           .                +-------+|Plugin     |
 * +-------------+   .                         +-----------+
 * | application |   .
 * |-------------|   .
 * |             |   .
 * |             |   .
 * +-------------+   .
 ```

浏览器事件（如用户点击了某个button）触发后，DOM将`event`传给`ReactEventListener`，它将事件分发到当前组件及以上的父组件。然后由`ReactEventEmitter`对每个组件进行事件的执行，先构造React合成事件，然后以`queue`的方式调用组件中声明的事件处理函数。

涉及到的主要类如下

`ReactEventListener`：负责事件注册和事件分发。React将`DOM`事件全都注册到`document`这个节点上。事件分发主要调用`dispatchEvent`进行，从事件触发组件开始，向父元素遍历。

`ReactEventEmitter`：负责每个组件上事件的执行。

`EventPluginHub`：负责事件的存储，合成事件以对象池的方式实现创建和销毁，大大提高了性能。

`SimpleEventPlugin`等plugin：根据不同的事件类型，构造不同的合成事件。如`focus`对应的React合成事件为`SyntheticFocusEvent`。


### 事件注册

React中注册事件很简单，譬如下面在JSX中注册事件：

```jsx
render() {
	return (
		<div onClick = { 
			(event) => {console.log(JSON.stringify(event))}
		}/>
	);
}
```

那么他是如何注册到React事件系统中的呢？