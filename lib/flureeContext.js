const jsonld = require('jsonld');
const url = require('url');
const { load } = require('cheerio');
const axios = require('axios');

const isUrl = (str) => ['http:', 'https:'].includes(url.parse(str)?.protocol);

const attemptExpanded = async (jsonldDoc, options) =>
  await jsonld.expand(jsonldDoc).catch(async (err) => {
    if (err.name === 'jsonld.SyntaxError') {
      throw err;
    }
    if (err.name === 'jsonld.InvalidUrl') {
      if (!options.errorOnInvalidUrl) {
        const context = Array.isArray(jsonldDoc['@context'])
          ? jsonldDoc['@context']
          : [jsonldDoc['@context']];
        const newContext = context.filter((x) => x !== err.details.url);
        return await attemptExpanded({
          ...jsonldDoc,
          ['@context']: newContext,
        });
      } else {
        if (err?.details?.url) {
          err.url = err.details.url;
        }
        throw err;
      }
    }
  });

const removeContext = (obj) => {
  const { '@context': _x, ...rest } = obj;
  return rest;
};

function extractStringsAndMap(variable) {
  // Create an array to store the strings and an object to store the map
  let strings = [];
  let map = {};

  // Check if the variable is a string
  if (typeof variable === 'string') {
    // If it is, add it to the 'strings' array
    strings.push(variable);
  }

  // Check if the variable is an array
  if (Array.isArray(variable)) {
    // If it is, loop through each element in the array
    for (const element of variable) {
      // Check if the element is a string
      if (typeof element === 'string') {
        // If it is, add it to the 'strings' array
        strings.push(element);
      }

      // Check if the element is an object
      if (typeof element === 'object' && !Array.isArray(element)) {
        // If it is, merge it with the 'map' object
        map = { ...map, ...element };
      }
    }
  }

  // Check if the variable is an object
  if (typeof variable === 'object' && !Array.isArray(variable)) {
    // If it is, merge it with the 'map' object
    map = { ...map, ...variable };
  }

  // Return an object with the 'strings' array and the 'map' object
  return {
    strings,
    map,
  };
}

function getInitialString(str) {
  // Find the position of the first colon in the string
  const colonPos = str.indexOf(':');

  // If there is no colon in the string, return the original string
  if (colonPos === -1) return str;

  // Return the substring up to the first colon
  return str.substring(0, colonPos);
}

jsonld.useDocumentLoader('node');

const flureeContext = function () {};

/**
 * Performs validation of a JSON-LD payload against its context and returns the validated portion of the payload.
 *
 * @param {Object} jsonldDoc the JSON-LD input to validate.
 * @param {Object} options options to use: errorOnLookupFailure, errorOnInvalid, expandContext
 * @param {Boolean} options.errorOnLookupFailure true to throw error if one or more context
 *            documents provided as URLs cannot be retrieved.
 *            If false, validation will continue against retrievable
 *            context documents. (default: false)
 * @param {Boolean} options.errorOnInvalid true to throw error if one or more properties
 *            or types cannot be validated against context map.
 *            If false, validation will continue and only valid properties
 *            or types will be returned by function (default: false)
 * @param {Boolean} options.expandContext true to replace context URLs with retrieved
 *            object map. false to leave context document as is (default: true)
 *
 * @return a Promise that resolves to the validated JSON-LD payload.
 */
flureeContext.validate = async function (jsonldDoc, options = {}) {
  // Check if the required number of arguments have been provided
  if (arguments.length < 1) {
    throw new TypeError(
      'Could not validate, too few arguments. No JSON-LD document provided.'
    );
  }

  // Check if a JSON-LD document has been provided
  if (jsonldDoc === null) {
    throw new TypeError('Could not validate. No JSON-LD document provided.');
  }

  // Check if the JSON-LD document has a '@context' property
  if (!jsonldDoc['@context']) {
    throw new TypeError(
      "Could not validate. No '@context' property in document"
    );
  }

  // Set default options
  const defaultOptions = {
    errorOnInvalid: false,
    errorOnLookupFailure: false,
    expandContext: true,
  };

  // Merge default options with provided options, giving precedence to provided options
  options = {
    ...defaultOptions,
    ...options,
  };

  let origContext = jsonldDoc['@context'];

  let validity = {
    isValid: true,
    errors: [],
  };
  let contextURLs = [];
  let dereferencedContextMap = {};

  // If the '@context' property is a string, add it to the array of context URLs
  if (typeof origContext === 'string') {
    contextURLs.push(origContext);

    // If the '@context' property is an array, loop through each element and add any strings to the array of context URLs, and any objects to the dereferenced context map
  } else if (Array.isArray(origContext)) {
    for (const element of origContext) {
      if (typeof element === 'string') {
        if (!isUrl(element)) {
          throw new TypeError(
            `The following provided '@context' value is not a valid URL: ${element}`
          );
        }
        contextURLs.push(element);
      }
      if (typeof element === 'object' && !Array.isArray(element)) {
        dereferencedContextMap = { ...dereferencedContextMap, ...element };
      }
    }
  }

  // Retrieve the context documents from the URLs provided in the '@context' property
  let retrievedContexts = await Promise.allSettled(
    contextURLs.map((url) =>
      jsonld.documentLoader(url, {
        headers: {
          Accept: 'application/ld+json',
        },
      })
    )
  );
  const rejected = retrievedContexts.find((x) => x.status === 'rejected');
  if (options.errorOnLookupFailure && rejected) {
    throw new TypeError(`Invalid URL ${rejected?.reason?.details?.url}`);
  }

  retrievedContexts = retrievedContexts
    .filter((x) => x.status === 'fulfilled')
    .map((x) => x.value);

  // Check if any of the context document retrievals failed
  const [successContexts, failedContextRetrieval] = retrievedContexts.reduce(
    (prev, curr) => {
      if (!curr.document) {
        return [prev[0], [...prev[1], curr]];
      }
      return [[...prev[0], curr], prev[1]];
    },
    [[], []]
  );

  if (options.errorOnLookupFailure && !!failedContextRetrieval[0]) {
    throw new TypeError(
      `Failed to retrieve context document from ${failedContextRetrieval[0].documentUrl}`
    );
  }

  for (const contextResponse of successContexts) {
    // Add the '@context' property of the context document to the dereferenced context map
    dereferencedContextMap = {
      ...contextResponse.document['@context'],
      ...dereferencedContextMap,
    };
  }

  // Create an object to store the expanded '@context' property of the JSON-LD document
  const newContext = options.expandContext ? {} : jsonldDoc['@context'];

  // Define a function to return the intersection of two objects
  function returnIntersection(obj1, obj2, expandContext = true) {
    // Create an empty object to store the intersection
    const intersection = {};
    // Loop through all the properties in obj1
    for (const key of Object.keys(obj1)) {
      // Check if the property also exists in obj2
      if (['@context', '@graph', '@id'].includes(key)) {
        intersection[key] = obj1[key];
      } else if (key === '@type') {
        if (Array.isArray(obj1[key])) {
          let newTypeArray = [];
          for (const ldType of obj1[key]) {
            if (obj2.hasOwnProperty(ldType)) {
              if (expandContext) {
                newContext[ldType] = obj2[ldType];
                const id = obj2[ldType]?.['@id'];
                if (!id) {
                  throw new TypeError(
                    `The following @type value is invalid: ${ldType} of IRI ${obj2[ldType]} appears not to be a Class`
                  );
                }
                const namespace = getInitialString(id);
                if (namespace) {
                  newContext[namespace] = obj2[namespace];
                }
              }
              newTypeArray.push(ldType);
            } else if (obj2.hasOwnProperty(getInitialString(ldType))) {
              newTypeArray.push(ldType);
            }
          }
          if (newTypeArray.length > 0) {
            intersection[key] = newTypeArray;
          }
        } else {
          if (obj2.hasOwnProperty(obj1[key])) {
            if (expandContext) {
              newContext[obj1[key]] = obj2[obj1[key]];
              const namespace = getInitialString(obj2[obj1[key]]?.['@id']);
              if (namespace) {
                newContext[namespace] = obj2[namespace];
              }
            }
            intersection[key] = obj1[key];
          }
        }
      } else if (obj2.hasOwnProperty(key)) {
        // If it exists, add it to the intersection object
        let val = obj1[key];
        if (typeof val === 'object') {
          if (Array.isArray(val) && val.every(typeof val === 'object')) {
            val = val.map((x) => returnIntersection(x, obj2, expandContext));
          } else if (!Array.isArray(val)) {
            val = returnIntersection(val, obj2, expandContext);
          }
        }
        intersection[key] = val;
        if (expandContext) {
          newContext[key] = obj2[key];
          const namespace = getInitialString(obj2[key]?.['@id']);
          if (namespace) {
            newContext[namespace] = obj2[namespace];
          }
        }
      } else if (obj2.hasOwnProperty(getInitialString(key))) {
        let val = obj1[key];
        intersection[key] = val;
      } else {
        validity.isValid = false;
        validity.errors = [...validity.errors, key];
      }
    }

    // Return the intersection object
    return intersection;
  }

  // Call the returnIntersection function to create the intersection of the JSON-LD document and the dereferenced context documents
  const validatedObject = returnIntersection(
    jsonldDoc,
    dereferencedContextMap,
    options.expandContext
  );

  validatedObject['@context'] = newContext;

  // If the 'errorOnInvalid' option is set to true and the document is not valid, throw an error
  if (options.errorOnInvalid && !validity.isValid) {
    throw new TypeError(
      `The following properties failed validation against the provided '@context': ${validity.errors.join(
        ', '
      )}`
    );
  }

  return validatedObject;
};

/**
 * Returns a simple boolean describing whether a JSON-LD payload can be validated against its context.
 *
 * @param {Object} jsonldDoc the JSON-LD input to validate.
 *
 * @return a Promise that resolves to the boolean.
 */
flureeContext.isValid = async function (jsonldDoc) {
  if (arguments.length < 1) {
    throw new TypeError(
      'Could not validate, too few arguments. No JSON-LD document provided.'
    );
  }

  if (jsonldDoc === null) {
    throw new TypeError('Could not validate. No JSON-LD document provided.');
  }

  if (!jsonldDoc['@context']) {
    throw new TypeError(
      "Could not validate. No '@context' property in document"
    );
  }

  try {
    await this.validate(jsonldDoc, { errorOnInvalid: true });
  } catch (error) {
    return false;
  }
  return true;
};

/**
 * Accepts a JSON-LD document and attempts to retrieve
 * the underlying vocabulary definitions for the types
 * and properties defined by valid URLs. Returns the
 * JSON-LD document enriched with those definitions.
 *
 * @param {Object} jsonldDoc the JSON-LD input to enrich.
 * @param {Object} options options to use: errorOnUndefinedProperties, errorOnInvalidUrl
 * @param {Boolean} options.errorOnUndefinedProperties true to throw error if one or more
 *          expanded types/properties described by a valid URL but no vocabulary
 *          document is available for lookup at that URL. false to proceed without
 *          throwing error (default: false)
 * @param {Boolean} options.errorOnInvalidUrl true to throw error if one or more properties
 *          or types is described by an invalid URL. False to proceed without
 *          throwing error (default: false)
 *
 * @return a Promise that resolves to the vocabulary-enriched JSON-LD payload.
 */
flureeContext.includeVocabulary = async function (jsonldDoc, options) {
  if (arguments.length < 1) {
    throw new TypeError(
      'Could not validate, too few arguments. No JSON-LD document provided.'
    );
  }

  if (jsonldDoc === null) {
    throw new TypeError('Could not validate. No JSON-LD document provided.');
  }

  if (!jsonldDoc['@context']) {
    throw new TypeError(
      "Could not validate. No '@context' property in document"
    );
  }

  // Set default options
  const defaultOptions = {
    errorOnLookupFailure: false,
    errorOnInvalidUrl: false,
  };

  // Merge default options with provided options, giving precedence to provided options
  options = {
    ...defaultOptions,
    ...options,
  };

  const expanded = await attemptExpanded(jsonldDoc, options);

  const pullVocabulary = (url) => {
    return axios
      .get(url)
      .then((res) => {
        const $ = load(res.data);
        // Query the HTML document for script tags with type "application/ld+json".
        const jsonScript = $('script[type="application/ld+json"]');

        // Get the JSON string from the script tag.
        const jsonString = jsonScript.text();

        // Parse the JSON string into a JavaScript object.
        const json = JSON.parse(jsonString);
        return json;
      })
      .catch((_) => {
        if (options.errorOnUndefinedProperties) {
          // if (!isUrl(url)) {
          //   throw new TypeError(
          //     `Could not retrieve `
          //   )
          // }
          throw new TypeError(
            `Could not retrieve property vocabulary document at ${url}`
          );
        } else {
          return { '@graph': [], '@context': [] };
        }
      });
  };

  const customReducer = (graphArray) =>
    graphArray.reduce((prev, curr) => ({ ...prev, [curr['@id']]: curr }), {});

  let interimContext = extractStringsAndMap(jsonldDoc['@context']);
  let updatedGraph = jsonldDoc['@graph']
    ? [...jsonldDoc['@graph']]
    : [removeContext(jsonldDoc)];
  updatedGraph = customReducer(updatedGraph);

  const collectVocabulary = async (expandedDoc) => {
    for (const key of Object.keys(expandedDoc)) {
      if (key === '@type') {
        let result;
        if (Array.isArray(expandedDoc[key])) {
          if (expandedDoc[key].some((x) => !isUrl(x))) {
            return;
          }
          result = await Promise.all(expandedDoc[key].map(pullVocabulary));
          result = result.filter((x) => x['@graph'].length > 0);
        } else {
          if (!isUrl(expandedDoc[key])) {
            return;
          }
          result = [await pullVocabulary(expandedDoc[key])];
        }
        for (const indivResult of result) {
          interimContext = {
            ...interimContext,
            map: { ...indivResult['@context'], ...interimContext.map },
          };
          updatedGraph = indivResult['@graph']
            ? {
                ...customReducer(indivResult['@graph']),
                ...updatedGraph,
              }
            : {
                ...customReducer([removeContext(indivResult)]),
                ...updatedGraph,
              };
        }
      } else if (isUrl(key)) {
        const result = await pullVocabulary(key);
        interimContext = {
          ...interimContext,
          map: { ...result['@context'], ...interimContext.map },
        };
        updatedGraph = result['@graph']
          ? {
              ...customReducer(result['@graph']),
              ...updatedGraph,
            }
          : { ...customReducer([removeContext(result)]), ...updatedGraph };
      }
    }
  };

  await collectVocabulary(expanded[0]);
  return {
    '@context': [...interimContext.strings, interimContext.map],
    '@graph': Object.values(updatedGraph).reverse(),
  };
};

module.exports = flureeContext;
