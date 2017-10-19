## React事件系统

### 简介

原生DOM事件体系存在很多问题，譬如各浏览器之间存在差异、容易造成内存浪费、性能低下、JS操作DOM效率低等。为了解决这些问题，React实现了一套比较高效的事件合成系统，包括事件注册、存储、分发、重用等功能。

与原生DOM事件体系相比，React事件合成系统有如下特点：
- 事件委托技术
- 事件冒泡机制
- 合成事件
- 事件池

#### 事件委托技术
在React组件上声明的事件最终都转化为原生事件并绑定到`document`上，而不是React组件对应的`DOM节点`。所以只有document节点绑定了原生事件。这样简化了事件体系，减少了内存开销。

#### 事件冒泡机制
原生DOM事件体系`“DOM2级事件”`规定的事件流包括三个阶段: 事件捕获阶段、处于目标阶段和事件冒泡阶段。而React自身实现了一套事件冒泡机制，以队列的方式，从触发事件的组件向父组件回溯，调用在组件上绑定的事件处理函数。调用`event.stopPropagation()`可以阻止React事件体系中的冒泡行为，但是不能阻止原生事件的冒泡。相反，如果阻止了原生事件中的冒泡行为，React合成事件中的冒泡行为也会被阻止。

```jsx
class EventTest extends React.Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
		this.handleParentClick = this.handleParentClick.bind(this);
	}

	componentDidMount() {
		this.button.addEventListener('click', function(e) {
			e.stopPropagation(); // 调用原生事件的stopPropagation，只能输出 3
			console.log(3); // 3
		});

		this.parent.addEventListener('click', function(e) {
			console.log(4); // 没有输出
		})
	}

	handleClick(e) {
		console.log(1); // 没有输出
	}

	handleParentClick(e) {
		console.log(2); // 没有输出
	}

	render() {
		return (
			<div onClick={this.handleParentClick}
				ref={(parent) => {this.parent = parent}}
				style={{width: 300, height: 300, background: "red", textAlign: "center"}} 
				>
				<button onClick={this.handleClick}
					style={{width: 80, height: 30, background: "green"}} 
					ref={(button) => {this.button = button}}>点我</button>
			</div>
		)
	}
}

ReactDOM.render(<EventTest />, document.getElementById('react-root'));
```
输出：3

```jsx
componentDidMount() {
	this.button.addEventListener('click', function(e) {
		console.log(3); // 3
	});

	this.parent.addEventListener('click', function(e) {
		console.log(4); // 4
	})
}

handleClick(e) {
	console.log(1); // 1
}

handleParentClick(e) {
	console.log(2); // 2
}
```
输出： 3 4 1 2

```jsx
componentDidMount() {
	this.button.addEventListener('click', function(e) {
		console.log(3); // 3
		// e.preventDefault(); // 调用 preventDefault() 不影响事件冒泡
	});

	this.parent.addEventListener('click', function(e) {
		console.log(4); // 4
	})
}

handleClick(e) {
	// e.preventDefault(); // 调用 preventDefault() 不影响事件冒泡
	e.stopPropagation();
	console.log(1); // 1
}

handleParentClick(e) {
	console.log(2); // 没有输出
}
```
输出： 3 4 1

```jsx
componentDidMount() {
	this.button.addEventListener('click', function(e) {
		console.log(3); // 3 早于handleClick、handleParentClick调用
	});

	this.parent.addEventListener('click', function(e) {
		console.log(4); // 4 早于handleClick、handleParentClick调用
	})
}

handleClick(e) {
	console.log(1); // 1
	e.nativeEvent.stopPropagation();
}

handleParentClick(e) {
	console.log(2); // 2
}
```
输出： 3 4 1 2


#### 合成事件
React在原生`event`基础上做了一层跨浏览器的封装 -- `SyntheticEvent(合成事件)`，`SyntheticEvent`与原生`event`拥有相同的接口，包括stopPropagation()和preventDefault()。在组件上定义的事件处理函数将会被传入`SyntheticEvent`的实例。我们可以通过`nativeEvent`属性来访问原生的浏览器event对象。

#### 事件池
React使用对象池来管理合成事件对象的创建和销毁，这样减少了垃圾的生成和新对象内存的分配，大大提高了性能。


### React事件处理与DOM事件处理

- React事件处理采用驼峰，DOM事件处理采用小写字母
- JSX中传递函数作为事件处理器，DOM事件处理为字符串
- DOM事件处理可以通过返回false组织浏览器默认行为，而React中需要使用preventDefault
- React事件处理函数的第一个参数为React定义的合成事件`SyntheticEvent`，可以通过`nativeEvent`属性来访问原生的浏览器event对象

```html
<button onclick="handleClick()">
	点我
</button>

<a href="#" onclick="console.log('额...'); return false">
	点我
</a>
```

```jsx
<button onClick={handleClick}>
	点我
</button>

function MyLink() {
	function handleClick(e) {
		e.preventDefault();  // 阻止跳转
		console.log('额...');
	}

	return (
		<a href="#" onClick={handleClick}>
			点我
		</a>
	);
}
```

### 事件处理函数中的this绑定

以ES6的类方式继承`React.Component`定义组件，其成员函数不会自动绑定`this`，需要开发者手动绑定，否则将它作为事件处理函数被调用时不能通过`this`获取当前组件实例对象。

```jsx
class Binding extends React.Component {
	constructor(props) {
		super(props);
		// This binding is necessary to make `this` work in the callback
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		// 绑定之后才能获取正确的this的值
		console.log(this); // 不绑定则为null
		console.log(123);
	}

	render() {
		return (
			<button onClick={this.handleClick}>
				点我
			</button>
		);
	}
}
```

在JSX中：`this.handleClick`的返回值为一个函数（类似于 onClick = myFunc），并没有绑定到具体对象（如果没有提前绑定的话）。所以事件触发时，该函数被调用不能通过`this`获取当前组件实例对象（如果没有提前绑定的话，因为执行的只是一个普通的函数）。


也可以这样（缺点是每次渲染都会重新创建回调函数，造成浪费）：

```jsx
class Binding extends React.Component {
	handleClick() {
		// 绑定之后才能获取正确的this的值
		console.log(this);
		console.log(123);
	}

	render() {
		return (
			<button onClick={this.handleClick.bind(this)}>
				点我
			</button>
		);
	}
}
```

也可以使用以下方法，不需要在构造函数中提前绑定this：

```jsx
class Binding extends React.Component {
	handleClick = () => {
		console.log(this);
		console.log(123);
	}

	render() {
		return (
			<button onClick={this.handleClick}>
				点我
			</button>
		);
	}
}
```

或者这样（缺点是每次渲染都会重新创建回调函数，造成浪费）：

```jsx
class Binding extends React.Component {
	handleClick() {
		console.log(this);
		console.log(123);
	}

	render() {
		return (
			<button onClick={(e) => this.handleClick(e)}>
				点我
			</button>
		);
	}
}
```

箭头函数没有自己的this，没有`this绑定`（普通函数中this的值为运行时绑定），意味着箭头函数内部的this值只能通过查找作用域链来确定。箭头函数中的this为最近作用域（父执行上下文）中this的值。另外，箭头函数没有自己的this，所以不能作为构造函数。

```jsx
var x = 1;
var obj = {
    x: 2,
    say: function(){
        console.log(this.x); // 2
    }
}
obj.say();
```
普通函数运行时确定this的值，因此obj.say()执行时，this指向obj。

```jsx
var x = 1;
var obj = {
    x: 2,
    say: () => {
       console.log(this.x); // 1
    }
}
obj.say();
```
箭头函数没有自己的this，箭头函数中的this为最近作用域（这里是全局作用域）中this的值，所以返回1。

```jsx
var a = 1;
function wrap(){
    this.a = 2;
    let b = function(){
        console.log(this.a); // 1
    };
    b();
}
var x = new wrap();
```
普通函数中this的值由函数的调用方式决定：
1) 直接调用函数，this的值为undefined（严格模式）或者window（非严格模式）
2) 作为对象方法调用，this的值为该对象
3) 作为构造函数调用（new），this的值为新创建的对象

```jsx
var a = 1;
function wrap(){
    this.a = 2;
    let b = () => { 
        console.log(this.a); // 2
    };
    b();
}
var x = new wrap();
```
父作用域中`this.a`的值为2。


### SyntheticEvent
`SyntheticEvent`有如下属性：

```jsx
boolean bubbles
boolean cancelable
DOMEventTarget currentTarget
boolean defaultPrevented
number eventPhase
boolean isTrusted
DOMEvent nativeEvent
void preventDefault()
boolean isDefaultPrevented()
void stopPropagation()
boolean isPropagationStopped()
DOMEventTarget target
number timeStamp
string type
```

> Note:
> As of v0.14, returning false from an event handler will no longer stop event propagation. Instead, e.stopPropagation() or e.preventDefault() should be triggered manually, as appropriate.

### Event Pooling
React使用对象池来管理合成事件对象的创建和销毁，这样`SyntheticEvent`可以被重用。当回调函数被调用之后，`SyntheticEvent`的属性会被置为`null`，所以不能以同步的方式来获取`event`。

```jsx
function onClick(event) {
    console.log(event);
    console.log(event.type); // => "click"
    const eventType = event.type; // => "click"

    setTimeout(function() {
        console.log(event.type); // => null
        console.log(eventType); // => "click"
    }, 0);

    // Won't work. this.state.clickEvent will only contain null values.
    this.setState({clickEvent: event});

    // You can still export event properties.
    this.setState({eventType: event.type});
}
```

```jsx
class EventPooling extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.onClick = this.onClick.bind(this);
    }

    onClick(event) {
        // event.persist();
        console.log(event); // => SyntheticEvent.
        console.log(event.type); // => "click"
        const eventType = event.type; // => "click"

        setTimeout(function() {
            console.log(event.type); // => null
            console.log(eventType); // => "click"
        }, 0);

        // Won't work. this.state.clickEvent will only contain null values.
        this.setState({clickEvent: event});

        // You can still export event properties.
        this.setState({eventType: event.type});
    }

    render() {
        console.log(this.state.clickEvent); // nullified object.(更新阶段完毕后)
        console.log(this.state.eventType); // click (更新阶段完毕后)

        return (
            <button onClick={this.onClick}>
                点我
            </button>
        );
    }
}
```
如果我们想以同步的方式获取event对象，需要调用`event.persist()`，合成事件将会从事件池中移除。我们可以保留合成事件对象的引用就可以以同步的方式访问event对象。


### 支持的事件
React标准化了事件对象，使之拥有一致的接口。事件处理函数会在冒泡阶段被依次调用。如果想在捕获阶段触发事件处理函数，需要为事件函数添加`Capture`前缀。譬如：`onClick` => `onCaptureClick`。

#### Clipboard Events
```jsx
onCopy onCut onPaste
```

属性
```jsx
DOMDataTransfer clipboardData
```

#### Composition Events
```jsx
onCompositionEnd onCompositionStart onCompositionUpdate
```

属性
```jsx
string data
```

#### Keyboard Events
```jsx
onKeyDown onKeyPress onKeyUp
```

属性
```jsx
boolean altKey
number charCode
boolean ctrlKey
boolean getModifierState(key)
string key
number keyCode
string locale
number location
boolean metaKey
boolean repeat
boolean shiftKey
number which
```

#### Focus Events
```jsx
onFocus onBlur
```

属性
```jsx
DOMEventTarget relatedTarget
```

#### Form Events
```jsx
onChange onInput onInvalid onSubmit
```

#### Mouse Events
```jsx
onClick onContextMenu onDoubleClick onDrag onDragEnd onDragEnter onDragExit
onDragLeave onDragOver onDragStart onDrop onMouseDown onMouseEnter onMouseLeave
onMouseMove onMouseOut onMouseOver onMouseUp
```

`onMouseEnter`和`onMouseLeave`事件从离开的元素到进入的元素传播而不是普通的冒泡方式，并且不存在捕获阶段。

属性
```jsx
boolean altKey
number button
number buttons
number clientX
number clientY
boolean ctrlKey
boolean getModifierState(key)
boolean metaKey
number pageX
number pageY
DOMEventTarget relatedTarget
number screenX
number screenY
boolean shiftKey
```

#### Selection Events
```jsx
onSelect
```

#### Touch Events
```jsx
onTouchCancel onTouchEnd onTouchMove onTouchStart
```

属性
```jsx
boolean altKey
DOMTouchList changedTouches
boolean ctrlKey
boolean getModifierState(key)
boolean metaKey
boolean shiftKey
DOMTouchList targetTouches
DOMTouchList touches
```

#### UI Events
```jsx
onScroll
```

属性
```jsx
number detail
DOMAbstractView view
```

#### Wheel Events
```jsx
onWheel
```

属性
```jsx
number deltaMode
number deltaX
number deltaY
number deltaZ
```

#### Media Events
```jsx
onAbort onCanPlay onCanPlayThrough onDurationChange onEmptied onEncrypted
onEnded onError onLoadedData onLoadedMetadata onLoadStart onPause onPlay
onPlaying onProgress onRateChange onSeeked onSeeking onStalled onSuspend
onTimeUpdate onVolumeChange onWaiting
```

#### Image Events
```jsx
onLoad onError
```

#### Animation Events
```jsx
onAnimationStart onAnimationEnd onAnimationIteration
```

属性
```jsx
string animationName
string pseudoElement
float elapsedTime
```

#### Transition Events
```jsx
onTransitionEnd
```

属性
```jsx
string propertyName
string pseudoElement
float elapsedTime
```

#### Other Events
```jsx
onToggle
```


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

那么它是如何注册到React事件系统中的呢？

从组件创建和更新的入口方法`mountComponent`和`updateComponent`说起。在这两个方法中，都会调用到`_updateDOMProperties`方法，对JSX中声明的组件属性进行处理。源码如下：

```jsx
_updateDOMProperties: function (lastProps, nextProps, transaction) {
    //...  前面代码太长，省略一部分
    else if (registrationNameModules.hasOwnProperty(propKey)) {
        // 如果是props这个对象直接声明的属性，而不是从原型链中继承而来的，则处理它
        // nextProp表示要创建或者更新的属性，而lastProp则表示上一次的属性
        // 对于mountComponent，lastProp为null。updateComponent二者都不为null。unmountComponent则nextProp为null
        if (nextProp) {
            // mountComponent和updateComponent中，enqueuePutListener注册事件
            enqueuePutListener(this, propKey, nextProp, transaction);
        } else if (lastProp) {
            // unmountComponent中，删除注册的listener，防止内存泄漏
            deleteListener(this, propKey);
        }
    }
}
```

下面我们来看enqueuePutListener，它负责注册JSX中声明的事件。源码如下:

```jsx
// inst: React Component对象
// registrationName: React合成事件名，如onClick
// listener: React事件回调方法，如onClick=callback中的callback
// transaction: mountComponent或updateComponent所处的事务流中，React都是基于事务流的
function enqueuePutListener(inst, registrationName, listener, transaction) {
    if (transaction instanceof ReactServerRenderingTransaction) {
        return;
    }
    var containerInfo = inst._hostContainerInfo;
    var isDocumentFragment = containerInfo._node && containerInfo._node.nodeType === DOC_FRAGMENT_TYPE;
    // 找到document
    var doc = isDocumentFragment ? containerInfo._node : containerInfo._ownerDocument;
    // 注册事件，将事件注册到document上
    listenTo(registrationName, doc);
    // 存储事件,放入事务队列中
    transaction.getReactMountReady().enqueue(putListener, {
        inst: inst,
        registrationName: registrationName,
        listener: listener
    });
}
```

`enqueuePutListener`主要做两件事，一方面将事件注册到`document`这个原生DOM上（这就是为什么只有`document`这个节点有DOM事件的原因），另一方面采用事务队列的方式调用`putListener`将注册的事件存储起来，以供事件触发时回调。

注册事件的入口是`listenTo`方法, 它解决了不同浏览器间捕获和冒泡不兼容的问题。事件回调方法在`bubble`阶段被触发。如果我们想让它在capture阶段触发，则需要在事件名上加上capture。比如`onClick`在`bubble`阶段触发，而`onCaptureClick`在capture阶段触发。listenTo代码虽然比较长，但逻辑很简单，调用`trapCapturedEvent`和`trapBubbledEvent`来注册捕获和冒泡事件。我们仅分析`trapBubbledEvent`，如下:

```jsx
trapBubbledEvent: function (topLevelType, handlerBaseName, element) {
    if (!element) {
        return null;
    }
    return EventListener.listen(
            element,     // 绑定到的DOM目标，也就是document
            handlerBaseName,     // eventType
            ReactEventListener.dispatchEvent.bind(null, topLevelType));    // callback, document上的原生事件触发后回调
},

listen: function listen(target, eventType, callback) {
    if (target.addEventListener) {
        // 将原生事件添加到target这个dom上,也就是document上。
        // 这就是只有document这个DOM节点上有原生事件的原因
        target.addEventListener(eventType, callback, false);
        return {
            // 删除事件,这个由React自己回调,不需要调用者来销毁。但仅仅对于React合成事件才行
            remove: function remove() {
                target.removeEventListener(eventType, callback, false);
            }
        };
    } else if (target.attachEvent) {
        // attach和detach的方式
        target.attachEvent('on' + eventType, callback);
        return {
            remove: function remove() {
                target.detachEvent('on' + eventType, callback);
            }
        };
    }
},
```

在listen方法中，我们终于发现了熟悉的`addEventListener`这个原生事件注册方法。只有document节点才会调用这个方法，故仅仅只有document节点上才有DOM事件。这大大简化了DOM事件逻辑，也节约了内存。

流程图如下：
![](https://github.com/Marco2333/react-demo/blob/master/demo/images/demo09_1.png)


### 事件存储

事件存储由`EventPluginHub`来负责，它的入口在我们上面讲到的`enqueuePutListener`中的`putListener`方法，如下:

```jsx
/**
* EventPluginHub用来存储React事件, 将listener存储到`listenerBank[registrationName][key]`
*
* @param {object} inst: 事件源
* @param {string} listener的名字,比如onClick
* @param {function} listener的callback
*/
putListener: function (inst, registrationName, listener) {
    // 用来标识注册了事件,比如onClick的React对象。key的格式为'.nodeId', 只用知道它可以标示哪个React对象就可以了
    var key = getDictionaryKey(inst);
    var bankForRegistrationName = listenerBank[registrationName] || (listenerBank[registrationName] = {});
    // 将listener事件回调方法存入listenerBank[registrationName][key]中,比如listenerBank['onclick'][nodeId]
    // 所有React组件对象定义的所有React事件都会存储在listenerBank中
    bankForRegistrationName[key] = listener;

    //onSelect和onClick注册了两个事件回调插件, 用于walkAround某些浏览器兼容bug,不用care
    var PluginModule = EventPluginRegistry.registrationNameModules[registrationName];
    if (PluginModule && PluginModule.didPutListener) {
        PluginModule.didPutListener(inst, registrationName, listener);
    }
},

var getDictionaryKey = function (inst) {
    return '.' + inst._rootNodeID;
};
```
由上可见，事件存储在了listenerBank对象中，它按照事件名和React组件对象进行了二维划分，比如nodeId组件上注册的onClick事件最后存储在listenerBank.onclick[nodeId]中。

## 事件执行

### 事件分发
当事件触发时，document上addEventListener注册的callback会被回调。从前面事件注册部分发现，此时回调函数为ReactEventListener.dispatchEvent，它是事件分发的入口方法。下面我们来详细分析

```jsx
// topLevelType：带top的事件名，如topClick。不用纠结为什么带一个top字段，知道它是事件名就OK了
// nativeEvent: 用户触发click等事件时，浏览器传递的原生事件
dispatchEvent: function (topLevelType, nativeEvent) {
    // disable了则直接不回调相关方法
    if (!ReactEventListener._enabled) {
        return;
    }

    var bookKeeping = TopLevelCallbackBookKeeping.getPooled(topLevelType, nativeEvent);
    try {
        // 放入批处理队列中,React事件流也是一个消息队列的方式
        ReactUpdates.batchedUpdates(handleTopLevelImpl, bookKeeping);
    } finally {
        TopLevelCallbackBookKeeping.release(bookKeeping);
    }
}
```

可见我们仍然使用批处理的方式进行事件分发，`handleTopLevelImpl`才是事件分发的真正执行者，它是事件分发的核心，体现了React事件分发的特点，如下

```jsx
// document进行事件分发,这样具体的React组件才能得到响应。因为DOM事件是绑定到document上的
function handleTopLevelImpl(bookKeeping) {
    // 找到事件触发的DOM和React Component
    var nativeEventTarget = getEventTarget(bookKeeping.nativeEvent);
    var targetInst = ReactDOMComponentTree.getClosestInstanceFromNode(nativeEventTarget);

    // 执行事件回调前,先由当前组件向上遍历它的所有父组件。得到ancestors这个数组。
    // 因为事件回调中可能会改变Virtual DOM结构,所以要先遍历好组件层级
    var ancestor = targetInst;
    do {
        bookKeeping.ancestors.push(ancestor);
        ancestor = ancestor && findParent(ancestor);
    } while (ancestor);

    // 从当前组件向父组件遍历,依次执行注册的回调方法. 我们遍历构造ancestors数组时,是从当前组件向父组件回溯的,故此处事件回调也是这个顺序
    // 这个顺序就是冒泡的顺序,并且我们发现不能通过stopPropagation来阻止'冒泡'。
    for (var i = 0; i < bookKeeping.ancestors.length; i++) {
        targetInst = bookKeeping.ancestors[i];
        ReactEventListener._handleTopLevel(bookKeeping.topLevelType, targetInst, bookKeeping.nativeEvent, getEventTarget(bookKeeping.nativeEvent));
    }
}
```

从上面的事件分发中可见，React自身实现了一套冒泡机制。从触发事件的对象开始，向父元素回溯，依次调用它们注册的事件callback。

### 事件callback调用
事件处理由_handleTopLevel完成。它其实是调用ReactBrowserEventEmitter.handleTopLevel() ，如下

```jsx
// React事件调用的入口。DOM事件绑定在了document原生对象上,每次事件触发,都会调用到handleTopLevel
handleTopLevel: function (topLevelType, targetInst, nativeEvent, nativeEventTarget) {
    // 采用对象池的方式构造出合成事件。不同的eventType的合成事件可能不同
    var events = EventPluginHub.extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget);
    // 批处理队列中的events
    runEventQueueInBatch(events);
}
```

handleTopLevel方法是事件callback调用的核心。它主要做两件事情，一方面利用浏览器回传的原生事件构造出React合成事件，另一方面采用队列的方式处理events。先看如何构造合成事件。

#### 构造合成事件

```jsx
// 构造合成事件
extractEvents: function (topLevelType, targetInst, nativeEvent, nativeEventTarget) {
    var events;
    // EventPluginHub可以存储React合成事件的callback,也存储了一些plugin,这些plugin在EventPluginHub初始化时就注册就来了
    var plugins = EventPluginRegistry.plugins;
    for (var i = 0; i < plugins.length; i++) {
        var possiblePlugin = plugins[i];
        if (possiblePlugin) {
            // 根据eventType构造不同的合成事件SyntheticEvent
            var extractedEvents = possiblePlugin.extractEvents(topLevelType, targetInst, nativeEvent, nativeEventTarget);
            if (extractedEvents) {
                // 将构造好的合成事件extractedEvents添加到events数组中,这样就保存了所有plugin构造的合成事件
                events = accumulateInto(events, extractedEvents);
            }
        }
    }
    return events;
},
```

EventPluginRegistry.plugins默认包含五种plugin，他们是在EventPluginHub初始化阶段注入进去的，且看代码

```jsx
// 将eventPlugin注册到EventPluginHub中
ReactInjection.EventPluginHub.injectEventPluginsByName({
    SimpleEventPlugin: SimpleEventPlugin,
    EnterLeaveEventPlugin: EnterLeaveEventPlugin,
    ChangeEventPlugin: ChangeEventPlugin,
    SelectEventPlugin: SelectEventPlugin,
    BeforeInputEventPlugin: BeforeInputEventPlugin
});
```

不同的plugin针对不同的事件有特殊的处理，此处我们不展开讲了，下面仅分析SimpleEventPlugin中方法即可。

我们先看SimpleEventPlugin如何构造它所对应的React合成事件。

```jsx
// 根据不同事件类型,比如click,focus构造不同的合成事件SyntheticEvent, 如SyntheticKeyboardEvent SyntheticFocusEvent
extractEvents: function (topLevelType, targetInst, nativeEvent, nativeEventTarget) {
    var dispatchConfig = topLevelEventsToDispatchConfig[topLevelType];
    if (!dispatchConfig) {
        return null;
    }
    var EventConstructor;

     // 根据事件类型，采用不同的SyntheticEvent来构造不同的合成事件
    switch (topLevelType) {
        //...  省略一些事件，我们仅以blur和focus为例
        case 'topBlur':
        case 'topFocus':
            EventConstructor = SyntheticFocusEvent;
        break;
        //...  省略一些事件
    }

    // 从event对象池中取出合成事件对象,利用对象池思想,可以大大降低对象创建和销毁的时间,提高性能。这是React事件系统的一大亮点
    var event = EventConstructor.getPooled(dispatchConfig, targetInst, nativeEvent, nativeEventTarget);
    EventPropagators.accumulateTwoPhaseDispatches(event);

    return event;
},
```

这里我们看到了event对象池这个重大特性，采用合成事件对象池的方式，可以大大降低销毁和创建合成事件带来的性能开销。

对象创建好之后，我们还会将它添加到events这个队列中，因为事件回调的时候会用到这个队列。添加到`events`中使用的是`accumulateInto`方法。它思路比较简单，将新创建的合成对象的引用添加到之前创建好的events队列中即可，源码如下

```jsx
function accumulateInto(current, next) {
    if (current == null) {
        return next;
    }

    // 将next添加到current中,返回一个包含他们两个的新数组
    // 如果next是数组,current不是数组,采用push方法,否则采用concat方法
    // 如果next不是数组,则返回一个current和next构成的新数组
    if (Array.isArray(current)) {
        if (Array.isArray(next)) {
            current.push.apply(current, next);
            return current;
        }
        current.push(next);
        return current;
    }

    if (Array.isArray(next)) {
        return [current].concat(next);
    }

    return [current, next];
}
```

#### 批处理合成事件
React以队列的形式处理合成事件。方法入口为runEventQueueInBatch，如下：

```jsx
function runEventQueueInBatch(events) {
    // 先将events事件放入队列中
    EventPluginHub.enqueueEvents(events);
    // 再处理队列中的事件,包括之前未处理完的。先入先处理原则
    EventPluginHub.processEventQueue(false);
}

/**
 * syntheticEvent放入队列中,等到processEventQueue再获得执行
 */
enqueueEvents: function (events) {
    if (events) {
        eventQueue = accumulateInto(eventQueue, events);
    }
},

/**
* 分发执行队列中的React合成事件。React事件是采用消息队列方式批处理的
*
* simulated：为true表示React测试代码，我们一般都是false 
*/
processEventQueue: function (simulated) {
    // 先将eventQueue重置为空
    var processingEventQueue = eventQueue;
        eventQueue = null;
    if (simulated) {
        forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseSimulated);
    } else {
        // 遍历处理队列中的事件,
        // 如果只有一个元素,则直接executeDispatchesAndReleaseTopLevel(processingEventQueue)
        // 否则遍历队列中事件,调用executeDispatchesAndReleaseTopLevel处理每个元素
        forEachAccumulated(processingEventQueue, executeDispatchesAndReleaseTopLevel);
    }
    // This would be a good time to rethrow if any of the event handlers threw.
    ReactErrorUtils.rethrowCaughtError();
},
```

合成事件处理也分为两步，先将我们要处理的events队列放入`eventQueue`中，因为之前可能就存在还没处理完的合成事件。然后再执行`eventQueue`中的事件。可见，如果之前有事件未处理完，这里就又有得到执行的机会了。

事件执行的入口方法为`executeDispatchesAndReleaseTopLevel`，如下

```jsx
var executeDispatchesAndReleaseTopLevel = function (e) {
    return executeDispatchesAndRelease(e, false);
};

var executeDispatchesAndRelease = function (event, simulated) {
    if (event) {
        // 进行事件分发,
        EventPluginUtils.executeDispatchesInOrder(event, simulated);

        if (!event.isPersistent()) {
            // 处理完,则release掉event对象,采用对象池方式,减少GC
            // React帮我们处理了合成事件的回收机制，不需要我们关心。但要注意，如果使用了DOM原生事件，则要自己回收
            event.constructor.release(event);
        }
    }
};

// 事件处理的核心
function executeDispatchesInOrder(event, simulated) {
    var dispatchListeners = event._dispatchListeners;
    var dispatchInstances = event._dispatchInstances;

    if (Array.isArray(dispatchListeners)) {
        // 如果有多个listener,则遍历执行数组中event
        for (var i = 0; i < dispatchListeners.length; i++) {
            // 如果isPropagationStopped设成true了,则停止事件传播,退出循环。
            if (event.isPropagationStopped()) {
                break;
            }
            // 执行event的分发,从当前触发事件元素向父元素遍历
            // event为浏览器上传的原生事件
            // dispatchListeners[i]为JSX中声明的事件callback
            // dispatchInstances[i]为对应的React Component 
            executeDispatch(event, simulated, dispatchListeners[i], dispatchInstances[i]);
        }
    } else if (dispatchListeners) {
        // 如果只有一个listener,则直接执行事件分发
        executeDispatch(event, simulated, dispatchListeners, dispatchInstances);
    }
    // 处理完event,重置变量。因为使用的对象池,故必须重置,这样才能被别人复用
    event._dispatchListeners = null;
    event._dispatchInstances = null;
}
```

`executeDispatchesInOrder`会先得到event对应的`listeners`队列，然后从当前元素向父元素遍历执行注册的callback。且看executeDispatch

```jsx
function executeDispatch(event, simulated, listener, inst) {
    var type = event.type || 'unknown-event';
    event.currentTarget = EventPluginUtils.getNodeFromInstance(inst);

    if (simulated) {
        // test代码使用,支持try-catch,其他就没啥区别了
        ReactErrorUtils.invokeGuardedCallbackWithCatch(type, listener, event);
    } else {
        // 事件分发,listener为callback,event为参数,类似listener(event)这个方法调用
        // 这样就回调到了我们在JSX中注册的callback。比如onClick={(event) => {console.log(1)}}
        // 这样应该就明白了callback怎么被调用的,以及event参数怎么传入callback里面的了
        ReactErrorUtils.invokeGuardedCallback(type, listener, event);
    }
    event.currentTarget = null;
}

// 采用func(a)的方式进行调用，
// 故ReactErrorUtils.invokeGuardedCallback(type, listener, event)最终调用的是listener(event)
// event对象为浏览器传递的DOM原生事件对象，这也就解释了为什么React合成事件回调中能拿到原生event的原因
function invokeGuardedCallback(name, func, a) {
    try {
        func(a);
    } catch (x) {
        if (caughtError === null) {
            caughtError = x;
        }
    }
}
```

流程图如下：

![](https://github.com/Marco2333/react-demo/blob/master/demo/images/demo09_2.png)


React事件体系源码分析部分转自[这里](https://zhuanlan.zhihu.com/p/25883536)

Reference: [React中文网](https://reactjs.org/docs/events.html)