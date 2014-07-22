var debug = require('debug')('browserify-search:search');
var async = require('async');
var request = require('superagent');

module.exports = function(query, pageOptions, cb) {
	debug('query %s', query);

	var pageSize = pageOptions.pageSize;
	var from = (pageOptions.page - 1) * pageSize;
	var url = 'http://forum.atlantajavascript.com:9200/browserify-search/module/_search';
	request(url)
		.send(JSON.stringify({
		  from: from,
		  size: pageSize,
		  query: {
			function_score: {
			  score_mode: 'multiply',
			  boost_mode: 'multiply',
			  query: {
				multi_match: {
				  query: query,
				  fields: [
					'search.name',
					'search.keywords',
					'search.description',
					'search.readme'
				  ]
				}
			  },
			  functions: [
				{
				  script_score: {
					script: "doc['browserifiability'].value"
				  }
				},
				{
				  script_score: {
					script: "pow(doc['downloadsLastMonth.cdf'].value, 1.5)"
				  }
				}
			  ]
			}
		  }
		}))
		.end(function(err, reply){
			err = err || reply.error;
			if (err) return cb(err);
			var hits = reply.body.hits.hits
			var modules = hits.map(function(hit){
				return {
					name: hit._id,
					score: hit._score,
					downloadsLastMonth: hit._source.downloadsLastMonth.count,
					description: hit._source.search.description,
					browserifiability: hit._source.browserifiability
				}
			});
			cb(null, modules);
		});

};