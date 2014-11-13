var parseQuery = require('./lib/parse_query')
var tokenize = parseQuery.tokenize
var assert = require('assert')

suite('tokenize', function(){
  test('simple', function(){
    assert.deepEqual(tokenize('one two three'), [
      {term: 'one two three', type: 'simple'}])
  })
  test('quoted', function(){
    assert.deepEqual(tokenize('"one two three"'), [
      {term: 'one two three', type: 'exact'}
    ])
  })
  test('combined', function(){
    assert.deepEqual(tokenize('one "two three"'), [
      {term: 'one', type: 'simple'},
      {term: 'two three', type: 'exact'}
    ])
    assert.deepEqual(tokenize('one "two three" four'), [
      {term: 'one four', type: 'simple'},
      {term: 'two three', type: 'exact'}
    ])
    assert.deepEqual(tokenize('one "two three" four "five six" seven'), [
      {term: 'one four seven', type: 'simple'},
      {term: 'two three', type: 'exact'},
      {term: 'five six', type: 'exact'}
    ])
  })
  test('dashed-words are exact', function(){
    assert.deepEqual(tokenize('one-two'), [
      {term: 'one-two', type: 'exact'}
    ])
  })
  test('dotted.words are exact', function(){
    assert.deepEqual(tokenize('one.two'), [
      {term: 'one.two', type: 'exact'}
    ])
  })
  test('author filter', function(){
    assert.deepEqual(tokenize('author:substack'), [
      {term: 'substack', type: 'filter', field: 'author'}
    ])
  })
  
  test('github-owner filter', function(){
    assert.deepEqual(tokenize('github-owner:raynos'), [
      {term: 'raynos', type: 'filter', field: 'githubRepo.owner'}
    ])
  })

})

var fields = [
  'search.name',
  'search.keywords',
  'search.description',
  'search.readme'
]

test('simple', function(){
  assert.deepEqual(
    parseQuery('one two three'),
    {
      multi_match: {
        query: 'one two three',
        fields: [
          'search.name',
          'search.keywords',
          'search.description',
          'search.readme'
        ]
      }
    }
  )
})

test('complex', function(){
  var query = parseQuery('one "two three" four-five six.seven "eight nine" ten')
  assert.deepEqual(
    query,
    {
      bool: {
        must: [
          {
            multi_match: {
              query: 'one ten',
              fields: fields
            }
          },
          {
            multi_match: {
              query: 'two three',
              fields: fields,
              type: 'phrase'
            }
          },
          {
            multi_match: {
              query: 'four-five',
              fields: fields,
              type: 'phrase'
            }
          },
          {
            multi_match: {
              query: 'six.seven',
              fields: fields,
              type: 'phrase'
            }
          },
          {
            multi_match: {
              query: 'eight nine',
              fields: fields,
              type: 'phrase'
            }
          }
        ]
      }
    }
  )
})


test('author filter', function(){
  var query = parseQuery('author:substack dom')
  assert.deepEqual(query,
    {
      filtered: {
        filter: {
          term: {
            'author': 'substack'
          }
        },
        query: {
          multi_match: {
            query: 'dom',
            fields: fields
          }
        }
      }
    }
  )
})

test('github-owner filter', function(){
  var query = parseQuery('github-owner:visionmedia dom')
  assert.deepEqual(query,
  {
    filtered: {
      filter: {
        term: {
          'githubRepo.owner': 'visionmedia'
        }
      },
      query: {
        multi_match: {
          query: 'dom',
          fields: fields
        }
      }
    }
  })
})

