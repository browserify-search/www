var express = require('express');
var stylish = require('stylish');
var favicon = require('static-favicon');
var browserify_file = require('browserify-file');
var taters = require('taters');
var enchilada = require('enchilada');
var hbs = require('hbs');

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
app.use(enchilada({
    src: __dirname + '/public/',
    compress: kProduction,
    cache: kProduction,
    transforms: [browserify_file]
}));

app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res, next) {
    res.render('index');
});

// TODO put search stuff here
app.get('/api/search', function(req, res, next) {
    var query = req.query.q;

    // sample results
    res.json([
        { name: 'reactive', description: 'foobar' },
        { name: 'xtend', description: 'foobaz' },
        { name: 'prototype', description: 'magic beans' }
    ]);
});

// 404 handler
app.use(function(req, res, next) {
    res.render('404');
});

// error handler
app.use(function(err, req, res, next) {
    console.log(err.stack);
});

module.exports = app;
