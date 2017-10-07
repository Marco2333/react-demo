import Mock from 'mockjs';
import $ from 'jquery';

Mock.mock('http://123.com', {
	'name': "MarcoHan",
	'age|1-100': 100,
	'color|4': [1, 2, 3]
});

$.ajax({
	url: 'http://123.com'
}).done(function(data, status, xhr) {
	console.log(JSON.stringify(data))
})