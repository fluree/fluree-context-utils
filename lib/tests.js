const flureeContext = require('./index');

const jsonldDoc = {
  '@context': ['https://schema.org', { wiki: 'http://wikidata.org/' }],
  '@id': 'https://www.wikidata.org/wiki/Q836821',
  //Bad Type!!
  '@type': 'GLURPY',
  name: "The Hitchhiker's Guide to the Galaxy",
  isBasedOn: {
    '@id': 'https://www.wikidata.org/wiki/Q3107329',
    '@type': 'Book',
    name: "The Hitchhiker's Guide to the Galaxy",
  },
};

const validatedJsonldDoc = flureeContext
  .validate(jsonldDoc, { expandContext: false })
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
