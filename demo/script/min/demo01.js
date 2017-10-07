var listOfItems = React.createElement("ul", {className: "list-of-items"}, 
						React.createElement("li", {className: "item-1"}, "Item 1"), 
						React.createElement("li", {className: "item-2"}, "Item 2"), 
						React.createElement("li", {className: "item-3"}, "Item 3")
					);

ReactDOM.render(listOfItems, document.getElementById('react-root'));