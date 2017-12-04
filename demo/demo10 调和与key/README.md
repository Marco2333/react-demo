## 调和(reconciliation) 与 key

React最神奇的地方莫过于通过`Virtual DOM`和高效的`diff`算法来解决原生DOM操作的性能问题。`Virtual DOM`的基本原理是用纯JS对象模拟原生DOM树来提高性能；`diff`算法让我们能够以高效的方式来更新DOM。

### 低效的原生DOM

原生的DOM对象是十分复杂的，我们打印一下一个简单的div元素的属性来看一下：

```js
var str = '',
    div = document.createElement('div');

for(var key in div) {
    str += key + " ";
}
console.log(str);
```

```
align title lang translate dir dataset hidden tabIndex accessKey draggable spellcheck contentEditable isContentEditable offsetParent offsetTop offsetLeft offsetWidth offsetHeight style innerText outerText onabort onblur oncancel oncanplay oncanplaythrough onchange onclick onclose oncontextmenu oncuechange ondblclick ondrag ondragend ondragenter ondragleave ondragover ondragstart ondrop ondurationchange onemptied onended onerror onfocus oninput oninvalid onkeydown onkeypress onkeyup onload onloadeddata onloadedmetadata onloadstart onmousedown onmouseenter onmouseleave onmousemove onmouseout onmouseover onmouseup onmousewheel onpause onplay onplaying onprogress onratechange onreset onresize onscroll onseeked onseeking onselect onstalled onsubmit onsuspend ontimeupdate ontoggle onvolumechange onwaiting onwheel ongotpointercapture onlostpointercapture onpointerdown onpointermove onpointerup onpointercancel onpointerover onpointerout onpointerenter onpointerleave click focus blur onauxclick nonce namespaceURI prefix localName tagName id className classList slot attributes shadowRoot assignedSlot innerHTML outerHTML scrollTop scrollLeft scrollWidth scrollHeight clientTop clientLeft clientWidth clientHeight onbeforecopy onbeforecut onbeforepaste oncopy oncut onpaste onsearch onselectstart previousElementSibling nextElementSibling children firstElementChild lastElementChild childElementCount onwebkitfullscreenchange onwebkitfullscreenerror setPointerCapture releasePointerCapture hasPointerCapture hasAttributes getAttributeNames getAttribute getAttributeNS setAttribute setAttributeNS removeAttribute removeAttributeNS hasAttribute hasAttributeNS getAttributeNode getAttributeNodeNS setAttributeNode setAttributeNodeNS removeAttributeNode closest matches webkitMatchesSelector attachShadow getElementsByTagName getElementsByTagNameNS getElementsByClassName insertAdjacentElement insertAdjacentText insertAdjacentHTML requestPointerLock getClientRects getBoundingClientRect scrollIntoView scrollIntoViewIfNeeded animate remove querySelector querySelectorAll webkitRequestFullScreen webkitRequestFullscreen scroll scrollTo scrollBy createShadowRoot getDestinationInsertionPoints before after replaceWith prepend append ELEMENT_NODE ATTRIBUTE_NODE TEXT_NODE CDATA_SECTION_NODE ENTITY_REFERENCE_NODE ENTITY_NODE PROCESSING_INSTRUCTION_NODE COMMENT_NODE DOCUMENT_NODE DOCUMENT_TYPE_NODE DOCUMENT_FRAGMENT_NODE NOTATION_NODE DOCUMENT_POSITION_DISCONNECTED DOCUMENT_POSITION_PRECEDING DOCUMENT_POSITION_FOLLOWING DOCUMENT_POSITION_CONTAINS DOCUMENT_POSITION_CONTAINED_BY DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC nodeType nodeName baseURI isConnected ownerDocument parentNode parentElement childNodes firstChild lastChild previousSibling nextSibling nodeValue textContent hasChildNodes getRootNode normalize cloneNode isEqualNode isSameNode compareDocumentPosition contains lookupPrefix lookupNamespaceURI isDefaultNamespace insertBefore appendChild replaceChild removeChild addEventListener removeEventListener dispatchEvent 
```

可以看出DOM元素是非常复杂的，而这仅仅是第一层属性。没办法，因为标准就是这样设计的。
相对于原生DOM对象，JS对象就简单多了，处理起来也更快。而DOM树上的属性、结构等信息我们可以用JS对象来表示，React就是用这种方式在内存中构建了一个`Virtual DOM`--`虚拟DOM树`，来作为原生DOM的映射。

`Virtual DOM`就像是JS和DOM之间的一个缓存，类似于CPU和硬盘之间的内存。CPU(JS)操作内存(虚拟DOM)，最后写入到硬盘(真实DOM)。

每当状态改变视图需要重新渲染时，React重新渲染出新的虚拟DOM树，对比新旧两棵虚拟DOM树，找出更新所需要的最小差异，最后根据差异更新真实DOM树，而这个找“差异”的过程就叫做`调和(reconciliation)`。


### 调和

React更新过程中比较新旧DOM树计算差异的过程称为调和(reconciliation)，为了实现高效的视图更新，调和的过程必须要快。但是标准的计算两棵N节点树差异的diff算法的时间复杂度是[O(N^3)](http://grfia.dlsi.ua.es/ml/algorithms/references/editsurvey_bille.pdf)，这显然无法满足高效更新UI的性能要求。

React对diff算法做了优化，使之时间复杂度为O(n)。React的diff算法并不能对两棵树做出最精确的diff，而是根据web应用的特点做了效率、准确率最合理的权衡。 

React根据web应用的特点做了两个简单的假设：

- 相同的组件产生类似的DOM结构，不同的组件产生不同的DOM结构
- 同一层次的List子节点们，通过唯一的id进行区分

基于这两个假设，React在计算新旧DOM差异的时候只会对比同一层级之间的元素差异。具体过程如下：

#### 节点类型不同

如果两棵树同一位置节点类型不同，React会直接删除之前的节点，创建并插入新的节点。此时，旧的组件会经历卸载阶段，新的组件会经历装载阶段。

对virtual DOM来说，原本的“更新”过程转为某些组件的“装载”和“卸载”过程。

```jsx
<div>
    <Todos/>
</div>
```

更新：
```jsx
<span>
    <Todos/>
</span>
```

更新操作会删除div元素及其子节点，创建新的span节点及其子节点。这显然是一种巨大的浪费，但这只是为了避免O(N^3)时间复杂度的对比算法。

为了避免这种情况的出现，开发者需要注意避免作为包裹功能的节点的类型改变。

#### 节点类型相同

如果新旧两棵树同一位置节点类型相同，React认为该节点只需要进行更新过程，不会触发节点的挂载与卸载。

这里区分一下节点的类型：
- DOM元素类型，对应HTML直接支持的元素类型，例如div、p、span等
- React组件类型，利用React定制的类型

对于DOM元素类型，React会保留节点对应的DOM元素，只更新节点上的属性和内容

```html
old: <div id="before" />
new: <div id="after" />
=> [replaceAttribute id "after"]
```

虚拟DOM的style属性稍有不同，其值为一个JS对象而不是一个简单字符串，转换过程如下：

```html
old: <div style={{color: 'red'}} />
new: <div style={{fontWeight: 'bold'}} />
=> [removeStyle color], [addStyle font-weight 'bold']
```

对于组件类型的节点，React需要根据新节点的props更新组件实例，并触发更新阶段的生命周期函数
- componentWillReceiveProps()
- shouldComponentUpdate()
- componentWillUpdate()
- render()
- componentDidUpdate()

如果`shouldComponentUpdate`返回false的话，那么对应组件的更新停止。

#### 多个子组件
在开发过程中，我们可以会遇到在一个父元素中循环产生多个子组件的情况，例如：

```jsx
<div>
    {
        arr.map((item) => (
            <Item text={item.text} key={item.id} />
        ))
    }
</div>
```

这个时候我们需要为组件添加key属性来避免更新过程中可能造成的浪费，下面我们看一下为什么需要key属性。

#### 组件列表存在的问题

假设组件的初始状态：

```jsx
<ul>
    <Item text="1"/>
    <Item text="2"/>
<ul/>
```

在最后添加一个Item组件，更新后的组件状态：

```jsx
<ul>
    <Item text="1"/>
    <Item text="2"/>
    <Item text="3"/>
<ul/>
```

这时候React会创建新的Item组件实例，这个组件实例会经历组件装载阶段，对于前两个组件会引发更新操作，但是我们可以使用shouldComponentUpdate来避免不必要的更新。

如果在开始插入一个Item组件，问题就出现了：

```jsx
<ul>
    <Item text="3"/>
    <Item text="1"/>
    <Item text="2"/>
<ul/>
```

React并不会直接在开始插入Item组件实例，而是依次对比每个Item组件，将text为1的组件实例改为text为3，将text为2的组件实例改为text为1，然后创建一个新的Item组件实例插入到最后。
这里理想情况下只需要一次插入操作，却引发了两个Item的更新，当Item实例增多的时候，会造成极大的浪费。所以需要开发者通过key属性来辅助React实现更加高效的更新操作。

### key的用法
key是一个字符串，用来唯一标识同一层级的兄弟元素。在React作新旧虚拟DOM树diff时，如果新树中某个子元素有key属性，那么React会比较相同层级的旧树中是否存在相同key的元素，如果存在则复用该元素以实现两棵树更加高效的转换。

通常在React元素中包含数量或顺序不确定的多个子元素(例如，从数组中的数据map返回的多个元素)时，我们需要为每个子元素添加key属性来帮助React识别哪个元素改变了、添加了或者删除了。

```jsx
const numbers = [1, 2, 3, 4, 5];
const listItems = numbers.map((number) =>
    <li key={number.toString()}>
        {number}
    </li>
);
```

#### key属性应该是稳定的并且在它的兄弟元素中是唯一的

例如，我们可以将数据中的id属性作为key属性的值：

```jsx
const todoItems = todos.map((todo) =>
    <li key={todo.id}>
        {todo.text}
    </li>
);
```

当没有稳定的标识属性作为key时，我们可以使用item的index作为key，但React非常不推荐这样做，因为数组中的元素可能会被reorder(index是不稳定的，可能会影响性能)：

```jsx
const todoItems = todos.map((todo, index) =>
    // Only do this if items have no stable IDs
    <li key={index}>
       {todo.text}
    </li>
);
```

#### key在被数组环绕的上下文中才有意义

错误的用法：

```jsx
function ListItem(props) {
    const value = props.value;
    return (
        // Wrong! There is no need to specify the key here:
        <li key={value.toString()}>
            {value}
        </li>
    );
}

function NumberList(props) {
    const numbers = props.numbers;
    const listItems = numbers.map((number) =>
        // Wrong! The key should have been specified here:
        <ListItem value={number} />
    );
    return (
        <ul>
            {listItems}
        </ul>
    );
}

const numbers = [1, 2, 3, 4, 5];
ReactDOM.render(
    <NumberList numbers={numbers} />,
    document.getElementById('root')
);
```

正确的用法：

```jsx
function ListItem(props) {
    // Correct! There is no need to specify the key here:
    return <li>{props.value}</li>;
}

function NumberList(props) {
    const numbers = props.numbers;
    const listItems = numbers.map((number) =>
        // Correct! Key should be specified inside the array.
        <ListItem key={number.toString()}
                      value={number} />

    );
    return (
        <ul>
            {listItems}
        </ul>
    );
}

const numbers = [1, 2, 3, 4, 5];
ReactDOM.render(
    <NumberList numbers={numbers} />,
    document.getElementById('root')
);
```

#### 元素的key属性在兄弟元素中必须是唯一的，而不是全局中唯一

```jsx
function Blog(props) {
    const sidebar = (
        <ul>
            {props.posts.map((post) =>
                <li key={post.id}>
                    {post.title}
                </li>
            )}
        </ul>
    );
    const content = props.posts.map((post) =>
        <div key={post.id}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
        </div>
    );
    return (
        <div>
            {sidebar}
            <hr />
            {content}
        </div>
    );
}

const posts = [
    {id: 1, title: 'Hello World', content: 'Welcome to learning React!'},
    {id: 2, title: 'Installation', content: 'You can install React from npm.'}
];
ReactDOM.render(
    <Blog posts={posts} />,
    document.getElementById('root')
);
```

key虽然是元素的属性，但是接受key的组件并不能读取到key的值，因为key和ref是React保留的两个特殊的prop，并没有预期让组件直接访问。所以如果在组件中需要相同的值，以其他属性传递给该组件：

```jsx
const content = posts.map((post) =>
    <Post
        key={post.id}
        id={post.id}
        title={post.title} />
);
```

Post组件中能够访问到props.id，但是不能访问到props.key。