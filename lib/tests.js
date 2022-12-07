const flureeContext = require('./index');

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
        TypeError: Could not retrieve property vocabulary document at 
            http://schema.org/noPropertyDescribedBySchemaDotOrg
    */
  });
