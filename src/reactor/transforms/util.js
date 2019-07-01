const { isNumber } = require('lodash');

export function numbersToStrings(object) {
  Object.keys(object).forEach((key) => {
    const value = object[key];

    if (isNumber(value)) {
      object[key] = value.toString();
    }
  })
}

export function mapProperties(object, mapping) {
  Object.keys(mapping).forEach((key) => {
    const newKey = mapping[key];
    object[newKey] = object[key];
  })
}

export function deleteProperties(object, properties) {
  properties.forEach((key) => {
    delete object[key];
  })
}
