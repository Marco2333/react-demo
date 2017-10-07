class InputControlES6 extends React.Component {
	constructor(props) {
		super(props);

		// 设置 initial state
		this.state = {
			text: props.initialValue || 'placeholder'
		};

		// ES6 类中函数必须手动绑定
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(event) {
		this.setState({
			text: event.target.value
		});
	}

	render() {
		return (
			<div>
                Type something:
                <input onChange={this.handleChange}
               value={this.state.text} />
            </div>
		);
	}
}

InputControlES6.propTypes = {
	initialValue: React.PropTypes.string
};
InputControlES6.defaultProps = {
	initialValue: ''
};

ReactDOM.render(<InputControlES6 initialValue = "Marco"/>, document.getElementById('react-root'));