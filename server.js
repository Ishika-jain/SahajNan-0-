const express = require("express");
const app = express();
const store = require("./store");

const PORT = process.env.PORT || 8080;
app.use(express.json());

app.get("/greeting", (req, res) => {
  return res.status(200).send("Hello world!");
});

app.post("/business-listing", (req, res) => {
  try {
    const { businessName, ownerName, category, city, establishmentYear } =
      req.body;

    if (
      !businessName ||
      !ownerName ||
      !category ||
      !city ||
      !establishmentYear
    ) {
      return res.status(400).send("Missing required field(s).");
    }
    const businessListingRequest = {
      businessName,
      ownerName,
      category,
      city,
      establishmentYear,
    };
    const businessListing = store.create(businessListingRequest);
    if (!businessListing) {
      return res.status(400).send("Business name already exists.");
    }
    return res.status(201).json(businessListing);
  } catch (error) {
    console.error("Error processing the request:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/business-listings/all", (req, res) => {
  try {
    const businessListings = store.readAll();
    return res.status(200).json(businessListings);
  } catch (error) {
    console.error("Error reading all business listings:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/business-listing/:id", (req, res) => {
  const id = req.params.id;
  try {
    const businessListing = store.read(id);
    if (!businessListing) {
      const msg = "Business listing with " + id + " was not found";
      return res.status(404).json({ message: msg });
    }
    return res.status(200).json(businessListing);
  } catch (error) {
    console.error("Error reading business listing:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/business-listings/search", (req, res) => {
  try {
    const businessListings = store.search(req.body);
    return res.status(200).json(businessListings);
  } catch (error) {
    console.error("Error searching business listings:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/business-listings/aggregate", (req, res) => {
  try {
    const aggregateres = store.aggregate(req.body);
    return res.status(200).json(aggregateres);
  } catch (error) {
    console.error("Error aggregating business listings:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log("Server running at PORT", PORT);
});
