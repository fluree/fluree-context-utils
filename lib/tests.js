const flureeContext = require('./index');

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