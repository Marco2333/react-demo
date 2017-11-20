## Fiber

### Question

#### Fiber 是什么

> React Fiber is a reimplementation of the React reconciler.

#### reconciler 是什么

React的特点之一是`Virtual DOM`，`Virtual DOM`的存在让开发变得更加容易。开发者只需要告诉React下一个状态应用应该什么样子，而不需要告诉浏览器需要做哪些操作来更新UI。

> The reconciler is the part of React which contains the algorithm used to diff one tree with another to determine which parts need to be changed.

关于调和(reconciliation) ，参考[这里](https://github.com/Marco2333/react-demo/tree/master/demo/demo10%20%E8%B0%83%E5%92%8C%E4%B8%8Ekey)。在刚刚发布的React16中，调和(reconciliation)和渲染(rendering)被分离开来，`reconciler`负责计算新旧树的Diff，`renderer`负责根据diff信息渲染APP。`react-dom`和`react-native`只是众多[`renderers`](https://github.com/chentsulin/awesome-react-renderer)中的两种`renderer`。

#### 为什么重写reconciler

主要原因之一：

> The main thread is the same as the UI thread.

渲染页面、响应用户操作、JS运行、处理网络活动、操作DOM都是由浏览器的主线程来处理的，虽然现在我们可以将部分操作安全地交给其他线程处理(`Web Worker`)，但是只有主线程可以操作DOM。

在React应用中，当状态改变或者prop更新时，React会通过调和算法对比新旧DOM树之间的差异，用最高效的方式更新UI。调和算法是很高效的，其时间复杂度为O(n)，问题出在React的调度策略——`Stack Reconcile`，类似于函数调用栈，React会深度优先遍历所有的Virtual DOM节点进行diff，等整棵Virtual DOM树计算完成之后才将任务出栈并释放主线程。所以当浏览器主线程被React更新状态任务占据的时候，用户与浏览器的任何交互都得不到反馈，只有任务结束之后才会突然得到浏览器的响应，这会造成非常不好的用户体验。