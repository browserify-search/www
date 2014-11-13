module.exports = function(query){
  var terms = tokenize(query)
  var filters = terms.filter(function(term){
    return term.type === 'filter'
  })
  var queries = terms.filter(function(term){
    return term.type !== 'filter'
  }).map(function(term){
    if (term.type === 'exact'){
      return {
        multi_match: {
          query: term.term,
          fields: [
            'search.name',
            'search.keywords',
            'search.description',
            'search.readme'
          ],
          type: 'phrase'
        }
      }
    }else{
      return {
        multi_match: {
          query: term.term,
          fields: [
            'search.name',
            'search.keywords',
            'search.description',
            'search.readme'
          ]
        }
      }
    }
  })
  var queryExp
  if (queries.length === 0){
    queryExp = null
  }else if (queries.length === 1){
    queryExp = queries[0]
  }else {
    queryExp = {
      bool: {
        must: queries
      }
    }
  }
  if (filters.length === 0){
    return queryExp
  }else{
    return {
      filtered: {
        filter: filterExpression(filters),
        query: queryExp
      }
    }
  }
}

function filterExpression(thing){
  if (Array.isArray(thing)){
    var filters = thing
    var exps = filters.map(filterExpression)
    if (exps.length === 1){
      return exps[0]
    }else{
      return {
        bool: {
          must: exps
        }
      }
    }
  }else{
    var filter = thing
    var term = {}
    term[filter.field] = filter.term
    return { term: term }
  }
}

module.exports.tokenize = tokenize

function tokenize(query){
  var terms = query.match(/("(.*?)"|[^\s]+)/g)
  if (!terms) return []
  return mergeInexact(terms.map(function(term){
    var m
    if (term[0] === '"' && term[term.length - 1] === '"'){
      return {
        term: term.substring(1, term.length - 1),
        type: 'exact'
      }
    }else if (m = term.match(/^author\:(.+)$/)){
      return {
        term: m[1],
        type: 'filter',
        field: 'author'
      }
    }else if (m = term.match(/^github\-owner\:(.+)$/)){
      return {
        term: m[1],
        type: 'filter',
        field: 'githubRepo.owner'
      }
    }else if (term.match(/[\.-]/)){
      return {
        term: term,
        type: 'exact'
      }
    }else{
      return {
        term: term,
        type: 'simple'
      }
    }
  }))
}

function mergeInexact(terms){
  var simpleTerms = terms.filter(function(term){
    return term.type === 'simple'
  })
  var others = terms.filter(function(term){
    return term.type !== 'simple'
  })
  var ret = others
  if (simpleTerms.length > 0){
    ret.unshift({
      term: simpleTerms
        .map(function(term){ return term.term })
        .join(' '),
      type: 'simple'
    })
  }
  return ret
}
