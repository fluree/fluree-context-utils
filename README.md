# flureeContext

## Introduction

This library is intended to help with dereferencing context and vocabulary documents from URLs, particularly when transacting JSON-LD payloads into Fluree.

## Installation

### Node.js + npm

```
npm install fluree-context-utils
```

```js
const flureeContext = require('fluree-context-utils');
```

## Examples

### validate

```js
const flureeContext = require('fluree-context-utils');

const jsonldDoc = {
  '@context': 'https://schema.org',
  '@id': 'https://www.wikidata.org/wiki/Q836821',
  '@type': ['Movie'],
  name: "The Hitchhiker's Guide to the Galaxy",
  //note this invalid property that will not be included in returned, validated result:
  noPropertyDescribedBySchemaDotOrg: 'foobar',
  isBasedOn: {
    '@id': 'https://www.wikidata.org/wiki/Q3107329',
    '@type': 'Book',
    name: "The Hitchhiker's Guide to the Galaxy",
  },
};

// Validate a JSON-LD payload by dereferencing the context definition from a URL such as https://schema.org
const validatedJsonldDoc = await flureeContext.validate(jsonldDoc);

console.log(JSON.stringify(validatedJsonldDoc, null, 2));
/* Output:
{
  "@context": {
    "name": {
      "@id": "schema:name"
    },
    "schema": "http://schema.org/",
    "isBasedOn": {
      "@id": "schema:isBasedOn",
      "@type": "@id"
    }
  },
  "@id": "https://www.wikidata.org/wiki/Q836821",
  "@type": [
    "Movie"
  ],
  "name": "The Hitchhiker's Guide to the Galaxy",
  "isBasedOn": {
    "@id": "https://www.wikidata.org/wiki/Q3107329",
    "@type": "Book",
    "name": "The Hitchhiker's Guide to the Galaxy"
  }
}*/
```

Options:

- errorOnLookupFailure

```js
const flureeContext = require('fluree-context-utils');

const jsonldDoc = {
  '@context': [
    'https://schema.org',
    'https://notarealwebsite-really-truly.org',
    'https://example.org',
  ],
  '@id': 'https://www.wikidata.org/wiki/Q836821',
  '@type': ['Movie'],
  name: "The Hitchhiker's Guide to the Galaxy",
};

try {
  const validatedJsonldDoc = await flureeContext.validate(jsonldDoc, {
    errorOnLookupFailure: true,
  });
} catch (error) {
  console.log(JSON.stringify(error, null, 2));
  /* Output:
    TypeError: Invalid URL https://notarealwebsite-really-truly.org
  */
}
```

-

### isValid

```js
const flureeContext = require('fluree-context-utils');

const jsonldDoc = {
  '@context': 'https://schema.org',
  '@id': 'https://www.wikidata.org/wiki/Q836821',
  '@type': ['Movie'],
  name: "The Hitchhiker's Guide to the Galaxy",
  //note this invalid property that will cause an invalid result:
  noPropertyDescribedBySchemaDotOrg: 'foobar',
  isBasedOn: {
    '@id': 'https://www.wikidata.org/wiki/Q3107329',
    '@type': 'Book',
    name: "The Hitchhiker's Guide to the Galaxy",
  },
};

flureeContext
  .isValid(jsonldDoc)
  .then((isValid) => {
    console.log({ isValid });
    /*
        Output:
            { isValid: false }
    */
  })
  .then((_) => {
    delete jsonldDoc.noPropertyDescribedBySchemaDotOrg;
  })
  .then((_) => flureeContext.isValid(jsonldDoc))
  .then((isValid) => {
    console.log({ isValid });
    /*
        Output:
            { isValid: true }
    */
  });
```

### includeVocabulary

```js
const flureeContext = require('fluree-context-utils');

const jsonldDoc = {
  '@context': 'https://schema.org',
  '@id': 'https://www.wikidata.org/wiki/Q836821',
  '@type': ['Movie'],
  name: "The Hitchhiker's Guide to the Galaxy",
  //note this invalid property that will not be included in returned, validated result:
  noPropertyDescribedBySchemaDotOrg: 'foobar',
  isBasedOn: {
    '@id': 'https://www.wikidata.org/wiki/Q3107329',
    '@type': 'Book',
    name: "The Hitchhiker's Guide to the Galaxy",
  },
};

// Validate a JSON-LD payload by dereferencing the context definition from a URL such as https://schema.org
flureeContext.includeVocabulary(jsonldDoc).then((validatedJsonldDoc) => {
  console.log(JSON.stringify(validatedJsonldDoc, null, 2));
  /*
  Output:
  {
    '@context': [
      'https://schema.org',
      {
        brick: 'https://brickschema.org/schema/Brick#',
        csvw: 'http://www.w3.org/ns/csvw#',
        dc: 'http://purl.org/dc/elements/1.1/',
        dcam: 'http://purl.org/dc/dcam/',
        dcat: 'http://www.w3.org/ns/dcat#',
        dcmitype: 'http://purl.org/dc/dcmitype/',
        dcterms: 'http://purl.org/dc/terms/',
        doap: 'http://usefulinc.com/ns/doap#',
        foaf: 'http://xmlns.com/foaf/0.1/',
        geo: 'http://www.opengis.net/ont/geosparql#',
        odrl: 'http://www.w3.org/ns/odrl/2/',
        org: 'http://www.w3.org/ns/org#',
        owl: 'http://www.w3.org/2002/07/owl#',
        prof: 'http://www.w3.org/ns/dx/prof/',
        prov: 'http://www.w3.org/ns/prov#',
        qb: 'http://purl.org/linked-data/cube#',
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        schema: 'https://schema.org/',
        sh: 'http://www.w3.org/ns/shacl#',
        skos: 'http://www.w3.org/2004/02/skos/core#',
        sosa: 'http://www.w3.org/ns/sosa/',
        ssn: 'http://www.w3.org/ns/ssn/',
        time: 'http://www.w3.org/2006/time#',
        vann: 'http://purl.org/vocab/vann/',
        void: 'http://rdfs.org/ns/void#',
        wgs: 'https://www.w3.org/2003/01/geo/wgs84_pos#',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
      },
    ],
    '@graph': [
      {
        '@id': 'https://www.wikidata.org/wiki/Q836821',
        '@type': ['Movie'],
        name: "The Hitchhiker's Guide to the Galaxy",
        noPropertyDescribedBySchemaDotOrg: 'foobar',
        isBasedOn: {
          '@id': 'https://www.wikidata.org/wiki/Q3107329',
          '@type': 'Book',
          name: "The Hitchhiker's Guide to the Galaxy",
        },
      },
      {
        '@id': 'schema:copyrightNotice',
        '@type': 'rdf:Property',
        'rdfs:comment':
          'Text of a notice appropriate for describing the copyright aspects of this Creative Work, ideally indicating the owner of the copyright for the Work.',
        'rdfs:label': 'copyrightNotice',
        'schema:domainIncludes': {
          '@id': 'schema:CreativeWork',
        },
        'schema:isPartOf': {
          '@id': 'https://pending.schema.org',
        },
        'schema:rangeIncludes': {
          '@id': 'schema:Text',
        },
        'schema:source': {
          '@id': 'https://github.com/schemaorg/schemaorg/issues/2659',
        },
      },
      {
        '@id': 'schema:spatialCoverage',
        '@type': 'rdf:Property',
        'owl:equivalentProperty': {
          '@id': 'dcterms:spatial',
        },
        'rdfs:comment':
          'The spatialCoverage of a CreativeWork indicates the place(s) which are the focus of the content. It is a subproperty of\n      contentLocation intended primarily for more technical and detailed materials. For example with a Dataset, it indicates\n      areas that the dataset describes: a dataset of New York weather would have spatialCoverage which was the place: the state of New York.',
        'rdfs:label': 'spatialCoverage',
        'rdfs:subPropertyOf': {
          '@id': 'schema:contentLocation',
        },
        'schema:domainIncludes': {
          '@id': 'schema:CreativeWork',
        },
        'schema:rangeIncludes': {
          '@id': 'schema:Place',
        },
      },
      //...
    ],
  };
  */
});
```

### <a name="tordf"></a>toRDF (N-Quads)

```js
// serialize a document to N-Quads (RDF)
const nquads = await jsonld.toRDF(doc, { format: 'application/n-quads' });
// nquads is a string of N-Quads
```

### <a name="fromrdf"></a>fromRDF (N-Quads)

```js
// deserialize N-Quads (RDF) to JSON-LD
const doc = await jsonld.fromRDF(nquads, { format: 'application/n-quads' });
// doc is JSON-LD
```

### Custom RDF Parser

```js
// register a custom synchronous RDF parser
jsonld.registerRDFParser(contentType, input => {
  // parse input to a jsonld.js RDF dataset object... and return it
  return dataset;
});

// register a custom promise-based RDF parser
jsonld.registerRDFParser(contentType, async input => {
  // parse input into a jsonld.js RDF dataset object...
  return new Promise(...);
});
```

### Custom Document Loader

```js
// how to override the default document loader with a custom one -- for
// example, one that uses pre-loaded contexts:

// define a mapping of context URL => context doc
const CONTEXTS = {
  "http://example.com": {
    "@context": ...
  }, ...
};

// grab the built-in Node.js doc loader
const nodeDocumentLoader = jsonld.documentLoaders.node();
// or grab the XHR one: jsonld.documentLoaders.xhr()

// change the default document loader
const customLoader = async (url, options) => {
  if(url in CONTEXTS) {
    return {
      contextUrl: null, // this is for a context via a link header
      document: CONTEXTS[url], // this is the actual document that was loaded
      documentUrl: url // this is the actual context URL after redirects
    };
  }
  // call the default documentLoader
  return nodeDocumentLoader(url);
};
jsonld.documentLoader = customLoader;

// alternatively, pass the custom loader for just a specific call:
const compacted = await jsonld.compact(
  doc, context, {documentLoader: customLoader});
```

### Node.js Document Loader User-Agent

It is recommended to set a default `user-agent` header for Node.js
applications. The default for the default Node.js document loader is
`jsonld.js`.

### Safe Mode

A common use case is to avoid JSON-LD constructs that will result in lossy
behavior. The JSON-LD specifications have notes about when data is dropped.
This can be especially important when calling [`canonize`][] in order to
digitally sign data. A special "safe mode" is available that will detect these
situations and cause processing to fail.

**Note**: This mode is designed to be the common way that digital signing and
similar applications use this library.

The `safe` options flag set to `true` enables this behavior:

```js
// expand a document in safe mode
const expanded = await jsonld.expand(data, { safe: true });
```

## Related Modules

- [jsonld-cli][]: A command line interface tool called `jsonld` that exposes
  most of the basic jsonld.js API.
- [jsonld-request][]: A module that can read data from stdin, URLs, and files
  and in various formats and return JSON-LD.

## Commercial Support

Commercial support for this library is available upon request from
[Digital Bazaar][]: support@digitalbazaar.com

## Source

The source code for the JavaScript implementation of the JSON-LD API
is available at:

http://github.com/digitalbazaar/jsonld.js

## Tests

This library includes a sample testing utility which may be used to verify
that changes to the processor maintain the correct output.

The main test suites are included in external repositories. Check out each of
the following:

    https://github.com/w3c/json-ld-api
    https://github.com/w3c/json-ld-framing
    https://github.com/json-ld/json-ld.org
    https://github.com/json-ld/normalization

They should be sibling directories of the jsonld.js directory or in a
`test-suites` dir. To clone shallow copies into the `test-suites` dir you can
use the following:

    npm run fetch-test-suites

Node.js tests can be run with a simple command:

    npm test

If you installed the test suites elsewhere, or wish to run other tests, use
the `JSONLD_TESTS` environment var:

    JSONLD_TESTS="/tmp/org/test-suites /tmp/norm/tests" npm test

This feature can be used to run the older json-ld.org test suite:

    JSONLD_TESTS=/tmp/json-ld.org/test-suite npm test

Browser testing can be done with Karma:

    npm run test-karma
    npm run test-karma -- --browsers Firefox,Chrome

Code coverage of node tests can be generated in `coverage/`:

    npm run coverage

To display a full coverage report on the console from coverage data:

    npm run coverage-report

The Mocha output reporter can be changed to min, dot, list, nyan, etc:

    REPORTER=dot npm test

Remote context tests are also available:

    # run the context server in the background or another terminal
    node tests/remote-context-server.js

    JSONLD_TESTS=`pwd`/tests npm test

To generate EARL reports:

    # generate the EARL report for Node.js
    EARL=earl-node.jsonld npm test

    # generate the EARL report for the browser
    EARL=earl-firefox.jsonld npm run test-karma -- --browser Firefox

To generate an EARL report with the `json-ld-api` and `json-ld-framing` tests
as used on the official [JSON-LD Processor Conformance][] page

    JSONLD_TESTS="`pwd`/../json-ld-api/tests `pwd`/../json-ld-framing/tests" EARL="jsonld-js-earl.jsonld" npm test

The EARL `.jsonld` output can be converted to `.ttl` using the [rdf][] tool:

    rdf serialize jsonld-js-earl.jsonld --output-format turtle -o jsonld-js-earl.ttl

Optionally follow the [report
instructions](https://github.com/w3c/json-ld-api/tree/master/reports) to
generate the HTML report for inspection. Maintainers can
[submit](https://github.com/w3c/json-ld-api/pulls) updated results as needed.

## Benchmarks

Benchmarks can be created from any manifest that the test system supports.
Use a command line with a test suite and a benchmark flag:

    JSONLD_TESTS=/tmp/benchmark-manifest.jsonld JSONLD_BENCHMARK=1 npm test

EARL reports with benchmark data can be generated with an optional environment
details:

    JSONLD_TESTS=`pwd`/../json-ld.org/benchmarks/b001-manifiest.jsonld JSONLD_BENCHMARK=1 EARL=earl-test.jsonld TEST_ENV=1 npm test

See `tests/test.js` for more `TEST_ENV` control and options.

These reports can be compared with the `benchmarks/compare/` tool and at the
[JSON-LD Benchmarks][] site.

[digital bazaar]: https://digitalbazaar.com/
[json-ld 1.0 api]: http://www.w3.org/TR/2014/REC-json-ld-api-20140116/
[json-ld 1.0 framing]: https://json-ld.org/spec/ED/json-ld-framing/20120830/
[json-ld 1.0]: http://www.w3.org/TR/2014/REC-json-ld-20140116/
[json-ld cg 1.1 api]: https://json-ld.org/spec/FCGS/json-ld-api/20180607/
[json-ld cg 1.1 framing]: https://json-ld.org/spec/FCGS/json-ld-framing/20180607/
[json-ld cg 1.1]: https://json-ld.org/spec/FCGS/json-ld/20180607/
[json-ld cg api latest]: https://json-ld.org/spec/latest/json-ld-api/
[json-ld cg framing latest]: https://json-ld.org/spec/latest/json-ld-framing/
[json-ld cg latest]: https://json-ld.org/spec/latest/json-ld/
[json-ld wg 1.1 api]: https://www.w3.org/TR/json-ld11-api/
[json-ld wg 1.1 framing]: https://www.w3.org/TR/json-ld11-framing/
[json-ld wg 1.1]: https://www.w3.org/TR/json-ld11/
[json-ld wg api latest]: https://w3c.github.io/json-ld-api/
[json-ld wg framing latest]: https://w3c.github.io/json-ld-framing/
[json-ld wg latest]: https://w3c.github.io/json-ld-syntax/
[json-ld benchmarks]: https://json-ld.org/benchmarks/
[json-ld processor conformance]: https://w3c.github.io/json-ld-api/reports
[json-ld wg]: https://www.w3.org/2018/json-ld-wg/
[json-ld]: https://json-ld.org/
[microdata]: http://www.w3.org/TR/microdata/
[microformats]: http://microformats.org/
[rdfa]: http://www.w3.org/TR/rdfa-core/
[rfc7159]: http://tools.ietf.org/html/rfc7159
[rollup]: https://rollupjs.org/
[wg test suite]: https://github.com/w3c/json-ld-api/tree/master/tests
[errata]: http://www.w3.org/2014/json-ld-errata
[jsonld-cli]: https://github.com/digitalbazaar/jsonld-cli
[jsonld-request]: https://github.com/digitalbazaar/jsonld-request
[rdf-canonize-native]: https://github.com/digitalbazaar/rdf-canonize-native
[test runner]: https://github.com/digitalbazaar/jsonld.js/blob/master/tests/test-common.js
[test suite]: https://github.com/json-ld/json-ld.org/tree/master/test-suite
[webpack]: https://webpack.js.org/
