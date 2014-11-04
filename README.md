# Website for Browserify Search

This project implements a web-based search engine similar to an early Google.

## API - `GET /api/search`

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

Open <http://localhost:3000> and you are set. Except: this webapp reads from an elasticsearch instance, so first you have to install elasticsearch.

### Install/Setup Elastic Search

* First things first, you need to [install elastic search](http://www.elasticsearch.org/). 
* Then you need to make sure you have the following settings in `elasticsearch.yml` (usually in the `config` directory within the location where Elastic Search is installed):

        http.max_content_length: 1000mb
        script.disable_dynamic: false

* start elasticsearch: `<path to elasticsearch>/bin/elasticsearch`
* Then, checkout the [scripts](https://github.com/browserify-search/scripts) project

        git clone git@github.com:browserify-search/scripts.git
        cd scripts
        
* `./update_mapping` - this will create (recreate) the Elastic Search db
* Get the [mongodb data dump files](https://www.dropbox.com/sh/5cqeb8xj4z35w6l/AAAp5QSiQT00b_KergLyowkma?dl=0) `modules.json` and `moduleStats.json`
* Run

        ./bulk_insert_elasticsearch_from_files.js modules.json moduleStats.json | curl -s -XPOST localhost:9200/browserify-search/module/_bulk --data-binary @-
* finally, start `./bin/www`. Now, try <http://localhost:3000>.

[See more](https://github.com/browserify-search/scripts#elastic-search).
