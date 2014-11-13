module.exports = function(query){
  var terms = tokenize(query)
  var parts = terms.map(function(term){
    if (term.exact){
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
  if (parts.length === 1){
    return parts[0]
  }else {
    return {
      bool: {
        must: parts
      }
    }
  }
}

module.exports.tokenize = tokenize

function tokenize(query){
  var terms = query.match(/("(.*?)"|[^\s]+)/g)
  return mergeInexact(terms.map(function(term){
    if (term[0] === '"' && term[term.length - 1] === '"'){
      return {
       term: term.substring(1, term.length - 1),
       exact: true
      }
    }else if (term.match(/[\.-]/)){
      return {
        term: term,
        exact: true
      }
    }else{
      return {
        term: term,
        exact: false
      }
    }
  }))
}

function mergeInexact(terms){
  var inexactTerms = terms.filter(function(term){
    return !term.exact
  })
  var exactTerms = terms.filter(function(term){
    return term.exact
  })
  var ret = exactTerms
  if (inexactTerms.length > 0){
    ret.unshift({
      term: inexactTerms
        .map(function(term){ return term.term })
        .join(' '),
      exact: false
    })
  }
  return ret
}
