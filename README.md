# flureeContext

## Introduction

This library is intended to help with dereferencing context and vocabulary documents from URLs, particularly when transacting JSON-LD payloads into Fluree.

## Installation

### Node.js + npm

```
npm install @fluree/fluree-context-utils
```

```js
const flureeContext = require('@fluree/fluree-context-utils');
```

## Examples

### validate

> Note: default `options` are as follows (explanations of their utility are described below):

```js
{
    errorOnInvalid: false,
    errorOnLookupFailure: false,
    expandContext: true,
  }
```

```js
const flureeContext = require('@fluree/fluree-context-utils');

const jsonldDoc = {
  '@context': 'https://schema.org',
  '@id': 'https://www.wikidata.org/wiki/Q836821',
  '@type': ['Movie'],
  name: "The Hitchhiker's Guide to the Galaxy",
  //note this invalid property that will not be included
  //in returned, validated result:
  noPropertyDescribedBySchemaDotOrg: 'foobar',
  isBasedOn: {
    '@id': 'https://www.wikidata.org/wiki/Q3107329',
    '@type': 'Book',
    name: "The Hitchhiker's Guide to the Galaxy",
  },
};

// Validate a JSON-LD payload by dereferencing the context
//definition from a URL such as https://schema.org
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

#### errorOnLookupFailure

True to throw error if one or more context documents provided as URLs cannot be retrieved. If false, validation will continue against retrievable context documents. (Default: False)

An example of using `errorOnLookupFailure: true`

```js
const flureeContext = require('@fluree/fluree-context-utils');

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

#### errorOnInvalid

True to throw error if one or more properties or types cannot be validated against context map. If false, validation will continue and only valid properties or types will be returned by function (Default: False)

An example of using `errorOnInvalid: true`

```js
const flureeContext = require('@fluree/fluree-context-utils');

const jsonldDoc = {
  '@context': ['https://schema.org'],
  '@id': 'https://www.wikidata.org/wiki/Q836821',
  '@type': ['Movie'],
  name: "The Hitchhiker's Guide to the Galaxy",
  //note this invalid property that will throw an
  //error when errorOnInvalid is set to TRUE:
  noPropertyDescribedBySchemaDotOrg: 'foobar',
};

try {
  const validatedJsonldDoc = await flureeContext.validate(jsonldDoc, {
    errorOnInvalid: true,
  });
} catch (error) {
  console.log(JSON.stringify(error, null, 2));
  /* Output:
    TypeError: The following properties failed validation against the provided '@context': noPropertyDescribedBySchemaDotOrg
  */
}
```

#### expandContext

True to replace context URLs with retrieved object map. False to leave context document as is (Default: True)

An example of using `expandContext: false`

```js
const flureeContext = require('@fluree/fluree-context-utils');

const jsonldDoc = {
  '@context': 'https://schema.org',
  '@id': 'https://www.wikidata.org/wiki/Q836821',
  '@type': ['Movie'],
  name: "The Hitchhiker's Guide to the Galaxy",
  //note this invalid property that will not be included
  //in returned, validated result:
  noPropertyDescribedBySchemaDotOrg: 'foobar',

  isBasedOn: {
    '@id': 'https://www.wikidata.org/wiki/Q3107329',
    '@type': 'Book',
    name: "The Hitchhiker's Guide to the Galaxy",
  },
};

// Validate a JSON-LD payload by dereferencing the context definition from a URL such as https://schema.org
const validatedJsonldDoc = await flureeContext.validate(jsonldDoc, {
  expandContext: false,
});

console.log(JSON.stringify(x, null, 2));
/*
  Output:
    {
        "@context": "https://schema.org",
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
    }
  */
```

### includeVocabulary

Accepts a JSON-LD document and attempts to retrieve the underlying vocabulary definitions for the types and properties defined by valid URLs. Returns the JSON-LD document enriched with those definitions.

> Note: default `options` are as follows (explanations of their utility are described below):

```js
{
    errorOnUndefinedProperties: false,
    errorOnInvalidUrl: false
  }
```

```js
const flureeContext = require('@fluree/fluree-context-utils');

const jsonldDoc = {
  '@context': 'https://schema.org',
  '@id': 'https://www.wikidata.org/wiki/Q836821',
  '@type': ['Movie'],
  name: "The Hitchhiker's Guide to the Galaxy",
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
      //...
      //...
      //...
    ],
  };
  */
});
```

Options:

#### errorOnUndefinedProperties

True to throw error if one or more expanded types/properties described by a valid URL but no vocabulary document is available for lookup at that URL. (Default: False)

An example of using `errorOnUndefinedProperties: true`

```js
const flureeContext = require('@fluree/fluree-context-utils');

const jsonldDoc = {
  '@context': 'https://schema.org',
  '@id': 'https://www.wikidata.org/wiki/Q836821',
  '@type': ['Movie'],
  name: "The Hitchhiker's Guide to the Galaxy",
  //note this invalid property that will cause an
  //undefined property error if errorOnUndefinedProperties is TRUE:
  noPropertyDescribedBySchemaDotOrg: 'foobar',

  isBasedOn: {
    '@id': 'https://www.wikidata.org/wiki/Q3107329',
    '@type': 'Book',
    name: "The Hitchhiker's Guide to the Galaxy",
  },
};

const validatedJsonldDoc = flureeContext
  .includeVocabulary(jsonldDoc, {
    errorOnUndefinedProperties: true,
  })
  .catch((err) => {
    console.log(err);
    /*
      Output:
        TypeError: Could not retrieve property vocabulary document at 
            http://schema.org/noPropertyDescribedBySchemaDotOrg
    */
  });
```

#### errorOnInvalidUrl

True to throw error if one or more properties or types is described by an invalid URL. False to proceed without throwing error (Default: False)

An example of using `errorOnInvalidUrl: true`

```js
const flureeContext = require('@fluree/fluree-context-utils');

const jsonldDoc = {
  //note this invalid URL that will cause an
  //invalid URL error if errorOnInvalidUrl is TRUE:
  '@context': 'https://woop-woop-not-a-site.org',
  '@id': 'https://www.wikidata.org/wiki/Q836821',
  '@type': ['Movie'],
  name: "The Hitchhiker's Guide to the Galaxy",
  isBasedOn: {
    '@id': 'https://www.wikidata.org/wiki/Q3107329',
    '@type': 'Book',
    name: "The Hitchhiker's Guide to the Galaxy",
  },
};

const validatedJsonldDoc = flureeContext
  .includeVocabulary(jsonldDoc, {
    errorOnInvalidUrl: true,
  })
  .catch((err) => {
    console.log(err);
    /*
      Output:
        url: 'https://woop-woop-not-a-site.org'
        jsonld.InvalidUrl: Dereferencing a URL did not result in a valid JSON-LD object. Possible causes are an inaccessible URL perhaps due to a same-origin policy (ensure the server uses CORS if you are using client-side JavaScript), too many redirects, a non-JSON response, or more than one HTTP Link Header was provided for a remote context.    
    */
  });
```

### isValid

```js
const flureeContext = require('@fluree/fluree-context-utils');

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
