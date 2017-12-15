# Fiber

## 问题

### Fiber的目标

> Increase its suitability for areas like animation, layout, and gestures.

### React Fiber

> React Fiber is a reimplementation of the React reconciler.

### Fiber的特点

> Incremental rendering: the ability to split rendering work into chunks and spread it out over multiple frames.

> The ability to pause, abort, or reuse work as new updates come in; the ability to assign priority to different types of updates; and new concurrency primitives.

### reconciler

> The reconciler is the part of React which contains the algorithm used to diff one tree with another to determine which parts need to be changed.

关于调和(reconciliation) ，参考[这里](https://github.com/Marco2333/react-demo/tree/master/demo/demo10%20%E8%B0%83%E5%92%8C%E4%B8%8Ekey)。


## 定义

### Reconciliation 与 Rendering

DOM只是React可以渲染的环境之一，除此之外还有通过React Native渲染的Native iOS、 Android Views等（所以Virtual DOM是用词不当的）。

在React中`reconciliation`和`rendering`是分离的，`reconciler`负责`reconciliation`，计算新旧DOM树的差异；`renderer`根据差异信息更新渲染UI。所以React DOM and React Native可以使用不同的`renderer`来渲染各自的UI，并且共用相同的`reconciler`。

`react-dom`和`react-native`只是众多[`renderers`](https://github.com/chentsulin/awesome-react-renderer)中的两种`renderer`。

### Scheduling 与 Work

- Work(工作)指任何需要进行的computations(计算)
- Scheduling(调度)指决定何时执行work


## React Fiber Architecture

### Fiber的目标

- 可以暂停work，之后再继续该work
- 不同类型的work拥有不同的优先级
- 能够重用之前已经完成的work
- 如果work不再需要则可以终止它

### React Fiber

> Fiber is a reimplementation of the stack, specialized for React components. You can think of a single fiber as a virtual stack frame.

React Fiber是React reconciler(调和器)的重新实现。Fiber将调和算法分成两个阶段：

- 调和阶段，对比新旧虚拟DOM树的差异，找出需要更新的地方，但并不会做实际的更新，这个阶段是可中断的。
- 提交阶段，将第一阶段找出的差异应用到DOM上，这个阶段是不能中断的，为了防止UI不一致情况的出现。

> If something is offscreen, we can delay any logic related to it. If data is arriving faster than the frame rate, we can coalesce and batch updates. We can prioritize work coming from user interactions (such as an animation caused by a button click) over less important background work (such as rendering new content just loaded from the network) to avoid dropping frames.

### Fiber 引进的新特性

- 可以将渲染过程中可中断的部分划分为一个个chunk
- 能够为渲染流程中的task设置不同的优先级
- 新的返回数据类型：fragments and strings
- 新的数据类型Portals：可以将subtree(子组件)直接渲染到DOM节点容器中
- 更好的服务端渲染renderToNodeStream
- Error Boundaries：能够提供清晰的错误信息，还能防止整个应用因错误而崩溃

### 为什么重写reconciler(调和器)

> The main thread is the same as the UI thread.

渲染页面、响应用户操作、JS运行、处理网络活动、操作DOM都是由浏览器的主线程来处理的，虽然现在我们可以将部分操作安全地交给其他线程处理(`Web Worker`)，但是只有主线程可以操作DOM。

在React应用中，当状态改变或者prop更新时，React会通过调和算法对比新旧DOM树之间的差异，用最高效的方式更新UI，调和算法是很高效的，其时间复杂度为O(n)。

问题出在React的调度策略——`Stack Reconciler`(在React15.x及之前的版本中采用`Stack Reconciler`——栈调和器)，类似于函数调用栈，React会深度优先遍历所有的Virtual DOM节点进行diff，等整棵Virtual DOM树计算完成之后（栈为空）释放主线程。所以当浏览器主线程被更新状态任务占据时，浏览器无法处理其他可能出现的更加紧急的任务，例如此时用户与浏览器的任何交互都得不到反馈，只有任务结束之后才会突然得到浏览器的响应，这会造成非常不好的用户体验。

Fiber可以很好地解决这个问题，`Fiber Reconciler`可以将可中断的work分割为chunks，并且能够为不同的任务赋予不同的优先级，这样主线程可以决定中断正在进行的diff算法，转而处理更加紧急的任务（譬如用户与UI的交互），稍后再继续之前中断的操作。

> The advantage of reimplementing the stack is that you can keep stack frames in memory and execute them however (and whenever) you want. This is crucial for accomplishing the goals we have for scheduling.

### Fiber与fiber

为了实现上面提到的目标，Fiber将work分解成多个单元(unit)。一个fiber就是work的一个单元，即Fiber(调和器算法)的基础单元是fiber(调和单元)。

React的UI解决方案是：View = F(Data)，即通过数据渲染UI，页面中所有相关的React Components共同组成了F，组件之间相互嵌套(调用)，类似于函数之间的嵌套调用。

计算机通过函数调用栈来跟踪程序的执行，当一个函数被调用，新的栈帧被压入栈中，函数执行完成，对应的栈帧出栈。UI的渲染有类似的过程，但是浏览器UI渲染线程和JS线程是相同的，如果栈中的任务占用线程太久就会影响UI的渲染，譬如动画卡顿、用户交互得不到及时响应。

Fiber就是为了解决这个问题，它定义了一个Virtual Stack(虚拟栈)，可以控制work的执行，包括中断、继续、终止等。一个fiber就是一个virtual stack frame(虚拟栈帧)，即 fiber === virtual stack frame。

通过虚拟栈，你可以将栈帧保存在内存中，随时可以执行或者弃用。

### fiber的结构

> A fiber is a JavaScript object that contains information about a component, its input and output.

[Fiber对象](https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiber.js)定义如下：

```jsx
// 一个Fiber对象作用于一个组件
export type Fiber = {|
    // 标记fiber类型tag.
    tag: TypeOfWork,
    // 唯一的标识符
    key: null | string,
    // fiber对应的function/class/module类型组件名.
    type: any,
    // fiber所在组件树的根组件FiberRoot对象
    stateNode: any,
    // 处理完当前fiber后返回的fiber，
    // 返回当前fiber所在fiber树的父级fiber实例
    return: Fiber | null,
    // fiber树结构相关链接
    child: Fiber | null,
    sibling: Fiber | null,
    index: number,

    // 当前处理过程中的组件props对象
    pendingProps: any, 
    // 缓存的之前组件props对象
    memoizedProps: any, // The props used to create the output.
    // The state used to create the output
    memoizedState: any,

    // 组件状态更新及对应回调函数的存储队列
    updateQueue: UpdateQueue<any> | null,

    // 描述当前fiber实例及其子fiber树的数位，
    // 如，AsyncUpdates特殊字表示默认以异步形式处理子树，
    // 一个fiber实例创建时，此属性继承自父级fiber，在创建时也可以修改值，
    // 但随后将不可修改。
    internalContextTag: TypeOfInternalContext,

    // 更新任务的最晚执行时间
    expirationTime: ExpirationTime,

    // Fiber `pooled`版本，用于记录组件更新过程中fiber的更新
    alternate: Fiber | null,

    // Conceptual aliases
    // workInProgress : Fiber ->  alternate The alternate used for reuse happens
    // to be the same as work in progress.
|};
```

#### `type`和`key`

- type描述了fiber对应的React组件。对于组合组件，其值为function或class组件本身；对于原生组件(div、span等)其值为该元素类型字符串；
- key用来在调和阶段标识fiber，以检测是否可重用该fiber实例；

#### `child`和`sibling`

指向其他fiber，描述了一个fiber的递归树结构；

`child fiber`对应了组件`render`方法的返回值，例如：

```jsx
function Parent() {
    return <Child />
}
```

`Parent`的`child fiber`对应了`Child`。
`sibling`字段是为了处理组件`render`方法返回多个子元素的情况(Fiber的新特性)。

```jsx
function Parent() {
    return [<Child1 />, <Child2 />]
}
```
`child fibers`组成了一个单向链表，链表头为第一个child。这里，`Parent`的`child fiber`对应了`Child1`，`Child1`的`sibling`对应了`Child2`。

#### `return`

返回当前fiber所在fiber树的父级fiber实例，即当前组件的父组件对应的fiber。

```jsx
function Parent() {
    return [<Child1 />, <Child2 />]
}
```
`Child1`和`Child2`返回的fiber为`Parent`对应的fiber。

#### `pendingProps`和`memoizedProps`

分别表示组件当前传入的及之前的props；
`pendingProps`属性在fiber开始执行时被设置，`memoizedProps`属性在fiber执行结束时被设置。
当`pendingProps`和`memoizedProps`相等时，标识fiber之前的输出可以被重用，这样可以避免不必要的work。

#### `alternate`

Fiber `pooled`版本，用于记录组件更新过程中fiber的更新，用作替换恢复重用。组件更新过程的各个阶段，更新前及更新过程中fiber状态并不一致，在需要恢复时(如发生冲突)，即可使用`alternate`回退至上一版本fiber。

- *flush*：`flush fiber`指将fiber的输出渲染至屏幕
- *work-in-progress*：一个还没有完成的fiber，栈帧(stack frame)还没有返回

在任一时刻，一个组件实例至多两个fiber与之对应：当前的(current)已`flush`的fiber以及`work-in-progress`的fiber。

- 使用`alternate`属性双向连接一个`current fiber`和其`work-in-progress`
- `current fiber`的alternate属性指向其`work-in-progress`，`work-in-progress`的alternate属性指向`current fiber`
- `current fiber`的替换版本是其`work-in-progress`，`work-in-progress`的替换版本是`current fiber`
- `work-in-progress`指向处理过程中的fiber，而`current fiber`总是维护处理完成的最新版本的fiber
- fiber的alternate属性通过`cloneFiber`创建，而不是每次都创建一个新的Object，`cloneFiber`会试图重用fiber的`alternate`


## 总结

- Fiber可以将work分割成一个个可以被中断的unit，这样使得更高优先级的任务可以跳到低优先级任务前面优先执行，从而使得应用更加`fluid`、`responsible`
- 在未来，可以实现分割tree的branches并交个不同的`worker`并行处理来提高效率


## Reference

- __[What is React Fiber ?](https://giamir.com/what-is-react-fiber)__
- __[React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)__