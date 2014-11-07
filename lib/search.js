var debug = require('debug')('browserify-search:search')
var async = require('async')
var request = require('superagent')
var config = require('../config.json')

module.exports = function(query, pageOptions, cb) {
	debug('query %s', query)

	var pageSize = pageOptions.pageSize
	var from = (pageOptions.page - 1) * pageSize
	var url = config.elastic_search + '/browserify-search/module/_search'
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
						script: "pow(doc['downloadsLastMonth.cdf'].value, 1.4)"
				  }
				}
			  ]
			}
		  }
		}))
		.end(function(err, reply){
			err = err || reply.error
			if (err) {
				if (reply) console.error(reply.text)
				return cb(err)
			}
			var hits = reply.body.hits.hits
			var total = reply.body.hits.total
			var modules = hits.map(function(hit){
				var module = hit._source
				var keywords = module.search.keywords
				var cdf = module.downloadsLastMonth.cdf
				var relevance = hit._score / module.browserifiability / Math.pow(cdf, 1.5)
				return {
					name: hit._id,
					relevance: relevance,
					downloadsLastMonth: module.downloadsLastMonth.count,
					popularity: cdf,
					description: module.search.description,
					keywords: keywords ? keywords.split(', ') : [],
					browserifiability: module.browserifiability
				}
			})
			cb(null, {
				total: total,
				hits: modules
			})
		})

}