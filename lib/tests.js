const flureeContext = require('./index');

const jsonldDoc = {
  '@context': 'https://schema.org',
  '@id': 'https://www.wikidata.org/wiki/Q836821',
  '@type': ['Movie'],
  name: "The Hitchhiker's Guide to the Galaxy",
  disambiguatingDescription:
    '2005 British-American comic science fiction film directed by Garth Jennings',
  titleEIDR: '10.5240/B752-5B47-DBBE-E5D4-5A3F-N',
  isBasedOn: {
    '@id': 'https://www.wikidata.org/wiki/Q3107329',
    '@type': 'Book',
    name: "The Hitchhiker's Guide to the Galaxy",
    isbn: '0-330-25864-8',
    author: {
      '@id': 'https://www.wikidata.org/wiki/Q42',
      '@type': 'Person',
      name: 'Douglas Adams',
    },
  },
};

const validatedJsonldDoc = flureeContext
  .includeVocabulary(jsonldDoc)
  .then((x) => {
    // debugger;
    console.log(JSON.stringify(x, null, 2));
  })
  .catch((err) => {
    // debugger;
    console.log(err);
    /*
      Output:
        TypeError: Could not retrieve property vocabulary document at 
            http://schema.org/noPropertyDescribedBySchemaDotOrg
    */
  });
