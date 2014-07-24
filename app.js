var express = require('express');
var stylish = require('stylish');
var favicon = require('static-favicon');
var browserify_file = require('browserify-file');
var taters = require('taters');
var hbs = require('hbs');
var debug = require('debug')('browserify-search:www');
var paginator = require('./lib/paginator');
var search = require('./lib/search');

hbs.registerHelper('paginate', paginator);
hbs.registerHelper('score', function(number){
	return (10 * number).toFixed(0)
})

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
}))

app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res, next) {
	res.render('index');
});

app.get('/search', function(req, res, next) {
	var query = req.query.q;
	var page = Number(req.query.page || 1);
	var pageSize = 10;
	var pageOptions = {
		page: page,
		pageSize: pageSize
	}

	search(query, pageOptions, 
		function(err, results) {
		if (err) {
			return next(err);
		}

		debug('results', results)
		res.render('search', {
			query: query,
			results: results,
			pageOptions: pageOptions
		});
	});
});

app.use(function(req, res, next) {
	res.render('404');
});

// error handler
app.use(function(err, req, res, next) {
	console.log(err.stack);
});

module.exports = app;
