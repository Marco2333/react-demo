## Immutable 详解

### Immutable Object

下面是维基百科对`immutable`对象的解释：

> In object-oriented and functional programming, an immutable object (unchangeable object) is an object whose state cannot be modified after it is created.This is in contrast to a mutable object (changeable object), which can be modified after it is created.

在面向对象和函数式编程中，`immutable`对象指那些一旦创建之后其状态就不能修改的对象。这是相对于`mutable`对象而言的，`mutable`对象在创建之后是可以被修改的。`immutable`对象具备__线程安全__的特性，也就是说如果没有其它限制，它可以在任意线程上自由使用。（当然这点对于JS来说并没有用，不过不排除将来JS出现多线程的特性）

对`immutable`对象的修改、删除操作会返回一个新的`immutable`对象，它可以简化我们的开发过程，让我们更加方便地进行数据拷贝、检测数据变化、数据缓存、版本控制（前进、回退）等。

### 为什么要在JS中使用Immutable Data
这里涉及到JS中的数据类型，ECMAScript中的数据类型分为两类：简单数据类型（也称为基本数据类型）和复杂数据类型（对象）：

- Primitive Data Types（基础数据类型）: String, Number, Boolean, Null, Undefined
- Composite(reference) Data Types（引用数据类型）：Object、Array、Date、RegExp、Function ...

JS中没有不可变的数据结构，对于复杂数据类型，变量之间的赋值是直接传递引用的，两个变量指向同一块内存区域，对其中一个的修改也会影响另一个。例如：
```js
let a = {x: 1, y: 2};
let b = a;
b.x = 'abc';
console.log(a.x);  // abc
```
虽然可变性可以带来一些好处（譬如可以节省内存），但是随着项目的复杂度增大，可变性往往带来更大的副作用。于是有了__深复制__与__浅复制__这一说，关于两者的介绍可以参考__[这里](http://hanyuehui.site/article-detail/102)__，里面讲到了__深复制__与__浅复制__的区别以及几种实现的方式。

__深复制__是通过递归复制对象内部的所有属性实现的，它会在内存中开辟一段新的区域来存储新对象，新旧对象不共享内存，所以互不影响。这样确实可以避免可变性带来的诸多问题，但是也引入了新的问题：性能与内存浪费。

- 性能：__深复制__每次都会重新递归复制一份对象，对象越复杂递归复制时间越长，造成性能浪费；另外，如果对象深度比较大，在访问对象内部属性时也会浪费较多时间；
- 内存：__深复制__产生的对象存放在新开辟的内存中，对它的修改不会影响旧对象；但是如果只是为了修改某个属性（新旧对象有很大的相似性）就重新复制全部对象属性会造成不必要的浪费；

__`Immutable`__可以很好地解决这个问题，它通过__[`Persistent Data Structure`](https://en.wikipedia.org/wiki/Persistent_data_structure)__（持久化数据结构）实现，每次对它进行修改的时候总会保存之前的版本，并产生一个修改之后的版本，这样能够保证新旧数据同时可用。为了解决内存浪费和递归复制所有属性带来的性能问题，__`Immutable`__采用__`Structural Sharing`__（结构共享）。在修改数据时，复用没有发生变化的部分，只修改发生变化的节点及其受影响的父节点。举个例子：
```js
let jsObj = {
	a: {
		a1: {
			a11: [1, 2, 3],
			a12: 0
		},
		a2: 1
	},
	b: {
		b1: [7, 8, 9],
		b2: 2
	},
	c: {
		c1: [0],
		c2: 3,
		c3: {
			c31: {
				c311: 'test' 
			},
			c32: (arg) => {console.log(arg)}
		}
	}
};

const imObj = Immutable.fromJS(jsObj);
const imObjUpdated = imObj.setIn(['c', 'c3', 'c32'], "Delete the arrow function!")
console.log(imObj.getIn(['c', 'c3', 'c32'])); // (arg) => {console.log(arg)}
console.log(imObjUpdated.getIn(['c', 'c3', 'c32'])); // Delete the arrow function!

console.log(imObj === imObjUpdated); // false
console.log(imObj.getIn(['a', 'a1']) === imObjUpdated.getIn(['a', 'a1'])); // true
console.log(imObj.getIn(['c', 'c1']) === imObjUpdated.getIn(['c', 'c1'])); // true
console.log(imObj.getIn(['c', 'c3']) === imObjUpdated.getIn(['c', 'c3'])); // false
console.log(imObj.getIn(['c', 'c3', 'c31']) === imObjUpdated.getIn(['c', 'c3', 'c31'])); // true
```
更新之前的数据结构可以简单的表示为下图：

![](https://github.com/Marco2333/react-demo/raw/master/demo/images/demo12_1.png)

更新之后如图所示：

![](https://github.com/Marco2333/react-demo/raw/master/demo/images/demo12_2.png)

下面是来自[网上](http://blog.csdn.net/ali1995/article/details/53728635)的一张动图，形象的展示了新旧对象树如何共享节点的：

![](https://github.com/Marco2333/react-demo/raw/master/demo/images/demo12_3.gif)

### Immutable的优缺点
#### 优点
- 提供了不可变对象的解决方案，弥补了JS中没有不可变数据结构的缺点；
- 采用`Persistent Data Structure`，能够保持新旧数据同时可用，使得数据可以回溯，类似Redo、Undo的功能实现更加方便；
- 采用`Structural Sharing`，能够尽量复用内存，没有被引用的对象会被回收，最大限度的节省内存；
- `Immutable`是函数式编程中的概念，而前端开发更加适合函数式编程。如果输入一致，则能保证输出一致，这样开发的组件更加容易组装调试，开发与维护更加便捷；
- 并发安全：多线程环境下不需要采用加锁的方式来解决数据一致问题，因为数据的修改只会产生新的对象，而不是影响原数据对象；（虽然JS是单线程的不需要考虑线程同步问题，但并不排除未来加入的可能）

#### 缺点
- 需要额外引入新的文件实现Immutable；
- 新的API：虽然现有的库会尽量与原生JS中的API保持一致，但是还是会有很多差异细节需要学习；
- 基于上一点原因，在开发时很容易与原生JS对象混淆；
- 因为Immutable对象每次修改都会返回新的对象，有时会忘记保存新返回的对象；

### Immutable库
目前主流的Immutable库有两个：
- [immutable.js](https://github.com/facebook/immutable-js)
- [seamless-immutable](https://github.com/rtfeldman/seamless-immutable)

#### immutable.js
`immutable.js`是Facebook的一个开源项目，主要用于解决JS中没有`Immutable`对象的问题。它提供了许多`Persistent Immutable`的数据结构，包括：`List`，`Stack`，`Map`，`OrderedMap`，`Set`，`OrderedSet`，`Record`。

`immutable.js`通过__[hash maps tries](https://en.wikipedia.org/wiki/Hash_array_mapped_trie)__和__[vector tries](http://hypirion.com/musings/understanding-persistent-vector-pt-1)__实现了`structural sharing`，使`Immutable`对象的操作更加高效，而且避免了内存的浪费。

虽然`immutable.js`和React同期问世并且和React配合能够解决开发过程中的很多痛点，但它并不属于React工具集。`immutable.js`是一个独立的库，能够配合其它框架完成开发，并提供高效的Immutable对象。

`immutable.js`的使用方法就不详细介绍了，大家可以参考[官网](http://facebook.github.io/immutable-js/)上的介绍。

#### seamless-immutable
`seamless-immutable`并没有实现完整的`Persistent Data Structure`，并且只支持`Array`和`Object`两种数据类型。优点是代码库比较小，相对比较轻量（`seamless-immutable.production.min.js`大小为7.26k，`immutable.min.js`大小为55.6k）。具体使用方法参考项目[github 地址](https://github.com/rtfeldman/seamless-immutable)。

### Immutable与React
关于React的思想可以归结为一个公式：
```js
UI = render(data)
```
用户看到的UI(界面)，是一个函数（render）的执行结果。该函数为一个纯函数，并且只接受一个参数—data，data指渲染UI所需要的数据。

> 纯函数指函数的输出只依赖输入，并且不产生任何副作用；如果两次函数调用的输入相同则输出必定也相同。

当data发生变化时，React会根据新的data重新渲染UI。React通过`Virtual DOM`来提高渲染的性能，利用`Virtual DOM`，React能够计算出每次更新对DOM树的最小修改，这个过程称为[调和](https://github.com/Marco2333/react-demo/tree/master/demo/demo10%20%E8%B0%83%E5%92%8C%E4%B8%8Ekey)。

虽然React能够尽量减少对DOM的操作，但是调和过程仍然会消耗不少时间（时间复杂度为O(n)）。如果在调和之前就能够判断组件的渲染结果是否有变化，没有变化就不进行调和与渲染，那么可以极大地提高性能。

`shouldComponentUpdate`就是为了完成这个功能的，React组件类的父类`Component`提供了`shouldComponentUpdate`的默认实现，但它仅仅是返回了true，表示默认情况下会进行调和并执行所有生命周期函数。因此，在进行组件开发时需要自己实现组件的`shouldComponentUpdate`。

React提供了[PureRenderMixin](https://reactjs.org/docs/pure-render-mixin.html)（新版本弃用）和[React.PureComponent](https://reactjs.org/docs/react-api.html#reactpurecomponent)，但是它们只提供了prop和state的浅比较方式，并不能深层比较新旧属性是否相同。

为什么不实现深层比较呢？因为如果prop或者state比较复杂，深层比较性能会很差。所以只做浅比较是一个相对比较合理的折中。

`Immutable`可以很好地解决这个问题，不仅可以深层比较数据是否发生变化，而且效率很高。

新的`shouldComponentUpdate`实现如下：
```js
import {is} from 'immutable';

shouldComponentUpdate(nextProps = {}, nextState = {}) {
    const thisProps = this.props || {};
    const thisState = this.state || {};

    if (Object.keys(thisProps).length !== Object.keys(nextProps).length ||
        Object.keys(thisState).length !== Object.keys(nextState).length) {
        return true;
    }

    for (const key in nextProps) {
        if (!is(thisProps[key], nextProps[key])) {
            return true;
        }
    }

    for (const key in nextState) {
        if (!is(thisState[key], nextState[key])) {
            return true;
        }
    }
    return false;
}
```

### Reference
- __[Persistent data structure](https://en.wikipedia.org/wiki/Persistent_data_structure)__
- __[Immutable collections for JavaScript](https://github.com/facebook/immutable-js)__
- __[Immutable 详解及 React 中实践](https://zhuanlan.zhihu.com/purerender/20295971)__