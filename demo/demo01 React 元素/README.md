# 创建第一个React元素


## 使用JavaScript创建React对象

### React.createElement(type, props, [children ...])
```js
ReactElement createElement(
    string/ReactClass type,
    [object props],
    [children ...]
)
```

#### type参数
必须为一个字符串或者是一个ReactClass

#### props参数
props参数是一个JavaScript对象，它会被从父元素传递到子元素

#### children参数
children参数描述了这个元素应该包含的子元素。子元素可以为任何类型的ReactNode，例如由ReactElement表示的虚拟DOM对象、由ReactText表示的字符串或数字，或者ReactFragment，即多个ReactNode的数组。

```js
var listItemElement1 = React.createElement('li', {className: 'item-1', key: 'item-1'}, 'Item-1')
var listItemElement2 = React.createElement('li', {className: 'item-2', key: 'item-2'}, 'Item-2')
var listItemElement3 = React.createElement('li', {className: 'item-3', key: 'item-3'}, 'Item-3')

var reactFragment = [listItemElement1, listItemElement2, listItemElement3];
var listOfItems = React.createElement('ul', {className: 'list-of-items'}, reactFragment);

ReactDOM.render(listOfItems, document.getElementById('react-root'));
```

### 通过创建工厂函数

```js
var createListItemElement = React.createFactory('li');

var listItemElement1 = createListItemElement({className: 'item-1', key: 'item-1'}, 'Item-1')
var listItemElement2 = createListItemElement({className: 'item-2', key: 'item-2'}, 'Item-2')
var listItemElement3 = createListItemElement({className: 'item-3', key: 'item-3'}, 'Item-3')

var reactFragment = [listItemElement1, listItemElement2, listItemElement3];
var listOfItems = React.createElement('ul', {className: 'list-of-items'}, reactFragment);

ReactDOM.render(listOfItems, document.getElementById('react-root'));
```

### 使用内置工厂函数创建通用的HTML标签

```js
var createListItemElement = React.createFactory('li');

var listItemElement1 = React.DOM.li({className: 'item-1', key: 'item-1'}, 'Item-1')
var listItemElement2 = React.DOM.li({className: 'item-2', key: 'item-2'}, 'Item-2')
var listItemElement3 = React.DOM.li({className: 'item-3', key: 'item-3'}, 'Item-3')

var reactFragment = [listItemElement1, listItemElement2, listItemElement3];
var listOfItems = React.createElement('ul', {className: 'list-of-items'}, reactFragment);

ReactDOM.render(listOfItems, document.getElementById('react-root'));
```

## 使用JSX创建React元素

JSX是一个可选的类似HTML的语法，通过它，我们可以不使用React.createElement()就可以创建虚拟DOM树。

```jsx
var listOfItems = <ul className="list-of-items">
					<li className="item-1">Item 1</li>
					<li className="item-2">Item 2</li>
					<li className="item-3">Item 3</li>
				</ul>;

ReactDOM.render(listOfItems, document.getElementById('react-root'));
```


## 渲染React元素

ReactDOM.render(ReactElement, DOMElement, callback);
