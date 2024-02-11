const fs = require("fs");
const uuid = require("uuid");

const DB_FILE_PATH = "businessListings.dat"; // Change the extension to represent a binary file
let businessListings = loadBusinessListings();

function loadBusinessListings() {
  try {
    const fileData = fs.readFileSync(DB_FILE_PATH);
    return deserializeData(fileData) || [];
  } catch (error) {
    console.error("Error loading business listings:", error);
    return [];
  }
}

function saveBusinessListings() {
  try {
    const serializedData = serializeData(businessListings);
    fs.writeFileSync(DB_FILE_PATH, serializedData);
  } catch (error) {
    console.error("Error saving business listings:", error);
  }
}

function serializeData(data) {
  // Implement your binary serialization logic here
  // This example converts data to a Buffer
  const serializedData = Buffer.from(JSON.stringify(data), "utf-8");
  return serializedData;
}

function deserializeData(data) {
  // Implement your binary deserialization logic here
  // This example assumes data is a Buffer and converts it to JSON
  return JSON.parse(data.toString("utf-8"));
}

function create(businessListingRequest) {
  if (
    businessListings.find(
      (listing) => listing.businessName === businessListingRequest.businessName
    )
  )
    return null;

  const newBusinessListing = {
    businessListingId: uuid.v4(),
    ...businessListingRequest,
  };
  businessListings.push(newBusinessListing);
  saveBusinessListings();

  return newBusinessListing;
}

function read(id) {
  const matchingListing = businessListings.find(
    (listing) => listing.businessListingId === id
  );
  if (matchingListing) {
    return matchingListing;
  } else {
    return null;
  }
}

function readAll() {
  return businessListings;
}

function search(searchCriteria) {
  if (
    !searchCriteria ||
    !searchCriteria.condition ||
    !searchCriteria.fields ||
    searchCriteria.fields.length === 0
  ) {
    console.error("Invalid search criteria");
    return [];
  }
  const filteredListings = businessListings.filter((listing) => {
    return searchCriteria.fields.some((field) => {
      const fieldValue = listing[field.fieldName];

      if (field.eq !== undefined) {
        return fieldValue === field.eq;
      } else if (field.neq !== undefined) {
        return fieldValue !== field.neq;
      }

      return false;
    });
  });

  return filteredListings;
}

function aggregate(aggregateCriteria) {
  const { groupByFields, aggregationRequests } = aggregateCriteria;
  const groupedListings = businessListings.reduce((groups, listing) => {
    const key = groupByFields.map((field) => listing[field]).join("-");
    groups[key] = groups[key] || [];
    groups[key].push(listing);
    return groups;
  }, {});

  const result = Object.entries(groupedListings).map(([key, listings]) => {
    const aggregatedValues = {};

    aggregationRequests.forEach((request) => {
      const { fieldName, function: aggregationFunction, alias } = request;

      switch (aggregationFunction) {
        case "COUNT":
          aggregatedValues[alias] = listings.length;
          break;
        case "MIN":
          aggregatedValues[alias] = Math.min(
            ...listings.map((item) => item[fieldName])
          );
          break;
        case "MAX":
          aggregatedValues[alias] = Math.max(
            ...listings.map((item) => item[fieldName])
          );
          break;
      }
    });

    const groupFields = key.split("-");
    groupFields.forEach((field, index) => {
      aggregatedValues[groupByFields[index]] = field;
    });

    return aggregatedValues;
  });

  return result;
}

module.exports = { create, read, readAll, search, aggregate };
