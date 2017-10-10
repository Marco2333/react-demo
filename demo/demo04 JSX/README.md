# JSX in React
JSX可以看做JavaScript的语法拓展（eXtension），看起来有点像XML，让我们可以在JavaScript中编写类似HTML的代码。 使用React，可以进行JSX语法到JavaScript的转换。

## Why JSX
我们可以直接使用原生js开发，而不需要使用JSX。但是React作者强烈建议我们使用JSX，因为JSX在定义类似HTML这种树形结构时，十分简单明了。简明的代码结构更利于开发和维护。XML有着开闭标签，在构建复杂的树形结构时，比函数调用和对象字面量更加容易读懂。
```jsx
//使用JSX
React.render(
    <div>
        <div>content</div>
    </div>,
    document.getElementById('example')
);

//不使用JSX
React.render(
    React.createElement('div', null,
        React.createElement('div', null, 'content')
    ),
    document.getElementById('example')
);
```

## 基本用法
### JSX与HTML的不同之处
- 在JSX中使用的“元素”不局限于HTML中的元素，可以是任何一个React组件
- 判断一个元素是HTML元素还是React组件的原则是第一个字母是否大写，如果为大写，则认为是React组件，否则认为是HTML元素。如果我们自定义的组件首字母写成小写，那会得不到我们想要的结果。
- 在JSX中可以通过onClick这样的方式来给一个元素添加事件处理函数，在HTML我们还可以用onclick（onclick和onClick是不同的）来添加事件

#### onclick和onClick
onclick
- onclick 添加的事件处理函数在全局环境中执行，污染全局环境，容易产生意想不到的后果
- 给过多DOM添加类似onclick的事件，可能会影响网页性能
- 对于使用类似onclick的DOM元素，如果要动态地从DOM树种删掉的话，需要把对应的事件处理器注销，否则可能会造成内存泄露，而一般情况下，这样的bug很难发现

onClick
- onClick挂载的函数，都控制在组件范围内，不会污染全局空间
- 采用事件委托，而不是直接使用onclick，无论有多少个onClick，其实最后都只是在DOM树上添加了一个事件处理函数，挂载在最顶层的DOM节点上
- 组件在unmount时React能够清除相关的事件处理函数，不会造成内存泄露

### 命名
文件名：使用大驼峰法，例如`MyComponent.js`；
组件命名：组件命名和文件名一致，如`MyComponent.js`里的组件名应该是`MyComponent`;一个目录的根组件使用index.js命名，以目录名称作为组件名称；
引用命名：React 组件使用大驼峰命名法，HTML 标签、组件实例使用小驼峰命名法；

### JSX 到JavaScript的转化
JSX将类似XML的语法转化到原生的JavaScript，元素的标签、属性和子元素都会被当作参数传给React.createElement函数：
```jsx
//JSX
var Nav;
var app = <Nav color="blue" />;

//native JS
var Nav;
var app = React.createElement(Nav, {color:"blue"});
```

### 命名空间组件
如果一个组件有许多关联的子组件，那么可以以该组件作为命名空间编写、调用子组件。
```jsx
 var MyFormComponent = React.createClass({ ... });

 MyFormComponent.Row = React.createClass({ ... });
 MyFormComponent.Label = React.createClass({ ... });
 MyFormComponent.Input = React.createClass({ ... });

 var Form = MyFormComponent;

 var App = (
   <Form>
     <Form.Row>
       <Form.Label />
       <Form.Input />
     </Form.Row>
   </Form>
 );
 ```
 ```js
 var App = (
    React.createElement(Form, null,
        React.createElement(Form.Row, null,
            React.createElement(Form.Label, null),
            React.createElement(Form.Input, null)
        )
    )
);
```

### 属性表达式
如果想在属性中使用JavaScript表达式，用 {} 来包裹表达式，使用 "" 会被当成字符串。
```jsx
// Input (JSX):
var person = <Person name={window.isLoggedIn ? window.name : ''} />;

// Output (JS):
var person = React.createElement(
  Person,
  {name: window.isLoggedIn ? window.name : ''}
);
```

### Boolean 属性
如果一个属性的值被省略，那么JSX会认为值为 `true`，如果想设置 `false`，必须使用属性表达式。在使用 HTML from 元素的时候会经常遇到这种情况，譬如带有 disabled, required, checked and readOnly 等属性的元素。
```jsx
// These two are equivalent in JSX for disabling a button
<input type="button" disabled />;
<input type="button" disabled={true} />;

// And these two are equivalent in JSX for not disabling a button
<input type="button" />;
<input type="button" disabled={false} />;
```

### 子表达式
同样，JavaScript表达式也可以用来修饰子元素
```jsx
// Input (JSX):
var content = <Container>{window.isLoggedIn ? <Nav /> : <Login />}</Container>;

// Output (JS):
var content = React.createElement(
  Container,
  null,
  window.isLoggedIn ? React.createElement(Nav) : React.createElement(Login)
);
```

### 注释
JSX与JavaScript注释一样
- 单行注释 // comments
- 多行注释 /* comments */
```jsx
var content = (
    <Nav>
        {/* child comment, put {} around */}
        <Person
          /* multi
             line
             comment */
          name={window.isLoggedIn ? window.name : ''} // end of line comment
        />
    </Nav>
);
```

## JSX 延伸属性
如果提前知道组件的属性：
```jsx
var component = <Component foo={x} bar={y} />;
```
如果我们一开始没法确定所有的属性，我们可能试图稍后添加到对象上：
```jsx
 var component = <Component />;
  component.props.foo = x; // bad
  component.props.bar = y; // also bad
```
这样写是错误的，因为我们手动直接添加的属性React后续没办法检查到属性类型错误，也就是说，当我们手动添加的属性发生类型错误时，在控制台是看不到错误信息的。

在React的设定中，初始化完props后，props是不可变的。改变props会引起无法想象的后果。

### 延伸属性
为了解决这个问题，React引入了属性延伸
```jsx
var props = {};
props.foo = x;
props.bar = y;
var component = <Component {...props} />;
```
当需要拓展我们的属性的时候，定义个一个属性对象，并通过{...props}的方式引入，React会帮我们拷贝到组件的props属性中。重要的是—这个过程是由React操控的，不是手动添赋值的属性。
我们可以多次使用这种特性，或者与其他属性一起使用。如果属性名相同，则后出现的属性将会覆盖之前的属性。
```jsx
  var props = { foo: 'default' };
  var component = <Component {...props} foo={'override'} />;
  console.log(component.props.foo); // 'override'
```

## JSX 陷阱
### HTML实体
在JSX中我们可以通过文字形式插入HTML实体：
```jsx
<div>First &middot; Second</div>
```
如果我们想动态地展示HTML实体，我们会陷入双编码问题，因为为了预防常见的 XSS 攻击，默认情况下React会编码所有我们要展示的内容。
```jsx
// Bad: It displays "First &middot; Second"
<div>{'First &middot; Second'}</div>
```
```jsx
var content='<strong>content</strong>';
React.render(
    <div>{content}</div>,
    document.body
);
```
页面会直接输出：<strong>content</strong>

解决方案：

**直接使用Unicode字符**
```jsx
<div>{'First \u00b7 Second'}</div>
```
**更安全的选择**

使用代表该html实体的Unicode数字编码值来获得对应的字符串：
```jsx
<div>{'First ' + String.fromCharCode(183) + ' Second'}</div>
```

我们也可以使用数组、字符串、JSX元素的混合，每个JSX元素需要一个唯一的 key:
```jsx
<div>{['First ', <span key="middot">&middot;</span>, ' Second']}</div>
```
**insert raw HTML**

下下策：插入原生HTML
```jsx
<div dangerouslySetInnerHTML={{__html: 'First &middot; Second'}} />
```

### 自定义HTML属性
如果我们在原生HTML元素上使用了用户自定义属性，React是不会渲染它们的。如果我们想在原生HTML元素上使用用户自定义属性，我们必须加上 `data-`的前缀。
```jsx
<div data-custom-attribute="foo" />
```
然而，用户自定义的元素上是可以使用任意属性的：
```jsx
<x-my-component custom-attribute="foo" />
```
Web Accessibility 属性 以 `aria-`为前缀也能被正常渲染。

### style属性
在React中写行内样式时，不能采用引号的书写方式：
```jsx
React.render(
    <div style={{color:'red'}}>
        xxxxx
    </div>,
    document.body
);
```