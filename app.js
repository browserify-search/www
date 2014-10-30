var express = require('express');
var stylish = require('stylish');
var favicon = require('static-favicon');
var browserify_file = require('browserify-file');
var taters = require('taters');
var hbs = require('hbs');
var debug = require('debug')('browserify-search:www');
var paginator = require('./lib/paginator');
var search = require('./lib/search');
var escape = require('escape-html');
var corsify = require('corsify');

hbs.registerHelper('paginate', paginator);
hbs.registerHelper('score', function(number){
	return (10 * number).toFixed(0);
});

// we set certain settings based on production or not
var kProduction = process.env.NODE_ENV === 'production';

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'html' );
app.set('view options', {
	cache: kProduction,
	layout: false
});
app.engine('html', hbs.__express);

//app.use(favicon(__dirname + '/static/favicon.ico'));

app.use(taters({
	cache: kProduction
}));
app.use(stylish({
	src: __dirname + '/public/',
	compress: kProduction
}));

app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res, next) {
	res.render('index');
});

app.get('/search', searchMethod(function(results, query, pageOptions, res){
	res.render('search', {
		query: query,
		total: results.total,
		results: results.hits,
		pageOptions: pageOptions
	});
}));

app.get('/api/search', corsify({
	 "Access-Control-Allow-Methods": "GET"
}, searchMethod(function(results, query, pageOptions, res){
	res.end(JSON.stringify({
		q: query,
		page: pageOptions.page,
		pageSize: pageOptions.pageSize,
		total: results.total,
		hits: results.hits
	}));
})));

function searchMethod(render){
	return function(req, res, next) {

		var query = req.query.q;
		var page = Number(req.query.page || 1);
		var pageSize = Number(req.query.pageSize || 20);
		if (pageSize > 100){
			pageSize = 100;
		}
		var accept = req.headers['Accept'];

		var pageOptions = {
			page: page,
			pageSize: pageSize
		};

		search(query, pageOptions, function(err, results) {
			if (err) {
				return next(err);
			}
			pageOptions.total = results.total;
			var hits = results.hits;

			hits.forEach(function(hit){
				hit.name = escape(hit.name);
				hit.description = escape(hit.description);
			});

			render(results, query, pageOptions, res);
		});

	}
}

app.use(function(req, res, next) {
	res.render('404');
});

// error handler
app.use(function(err, req, res, next) {
	console.log(err.stack);
});

module.exports = app;
