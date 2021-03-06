module.exports = function(query, options){
  var thisPage = options.page
  var total = options.total
  var pageSize = options.pageSize || 10
  var numberOfPages = 6
  var firstPage = Math.max(options.page - (numberOfPages / 2), 1)
  var lastPage = Math.min(1 + Math.ceil(total / pageSize), firstPage + numberOfPages)
  var markup = '<ul class="pagination">'
  if (thisPage > 1){
    markup += '<li><a href="/search?q=' + escape(query) + '&page=' + (thisPage - 1) + '">&#8592</a></li>'
  }
  for (var i = firstPage; i < lastPage; i++){
    if (i === thisPage){
      markup += '<li class="active"><a href="#">' + i + ' <span class="sr-only">(current)</span></a>'
    }else{
      markup += '<li><a href="/search?q=' + escape(query) + '&page=' + i + '">'
        + i + '</a></li>'
    }
  }
  if (thisPage < lastPage - 1){
    markup += '<li><a href="/search?q=' + escape(query) + '&page=' + (thisPage + 1) + '"">&#8594</a></li>'
  }
  markup += '</ul>'
  return markup
}