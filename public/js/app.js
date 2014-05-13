var page = require('page');
var Index = require('./index');
var idx = Index(page);
window.debug = require('debug')

document.body.appendChild(idx.element);

page('/', function(){
  idx.focus();
});

page('/:query', function(context){
  var query = context.params.query;
  idx.search(query);
  idx.searchBox.value = query;
  idx.searchBox.select();
});

page();
