# Website for Browserify Search

## `GET /api/search`

Query parameters:

* `q` - the query string, what you want to search for
* `page` - page number into the result set you want returned
* `pageSize` - the number of results (hits) you want returned, defaults to 20, maximum is 100

Results Format:

* `q` - same as `q` in the query parameters
* `page` - same as `page` in the query parameters
* `pageSize` - same as `pageSize` in the query parameters
* `hits` - an array of hits returned for the current page, the format of which will be listed below
* `total` - the total number of hits

Hit format:

* `name` - name of the module
* `relevance` - how relevant is this module to the search terms
* `downloadsLastMonth` - how many downloads of this module in the last month?
* `popularity` - the popularity score of the module
* `description` - description of the module
* `browserifiability` - the probability that this module will work with Browserify given our best guess

## Developing On This

```
./bin/www
```

Open localhost:3000

This webapp reads from an elasticsearch instance, so first you have to install elasticsearch. I am working on providing a simple way to get set up so that others can easily hack on this repo.
