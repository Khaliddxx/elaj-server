const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const HttpError = require("../middleware/http-error");

// Get all products
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

// Get product by id
router.get("/:id", async (req, res, next) => {
  let product;
  const id = req.params.id;
  try {
    product = await Product.findOne({ _id: id });
  } catch (err) {
    const error = new HttpError(
      "Fetching product failed, please try again later.",
      500
    );
    console.log(err);
    return next(error);
  }
  res.json({
    product: product,
  });
});

// Get products by pharmacy
router.get("/pharmacy-products/:pharmacy", async (req, res) => {
  let products;
  const pharmacy = req.params.pharmacy;
  try {
    products = await Product.find({ pharmacy: pharmacy });
  } catch (err) {
    const error = new HttpError(
      "Fetching product failed, please try again later.",
      500
    );
    console.log(err);
    return next(error);
  }
  res.json({
    products: products,
  });
});

// Add product (by pharmacy id)
router.post("/add/:pharmacyId", async (req, res, next) => {
  console.log(req.body);
  const pharmacyId = req.params.pharmacyId;
  console.log(pharmacyId);
  // products array???!!!!!
  let {
    name,
    description,
    price,
    stock,
    image,
    needsPrescription,
    category,
    pharmacy,
    expiryDate,
  } = req.body;

  let existingProduct;
  try {
    existingProduct = await Product.findOne({
      name: name,
      description: description,
      price: price,
      stock: stock,
      image: image,
      needsPrescription: needsPrescription,
      // Category array???!!!
      //   [category]
      category: category,
      pharmacy: pharmacy,
      expiryDate: expiryDate,
    });
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Creating product failed, please try again later.",
      500
    );
    return next(error);
  }
  //
  if (existingProduct) {
    // console.log(existingUsers)
    const error = new HttpError(
      "Product already exists, please try again.",
      422
    );
    return next(error);
  }
  console.log("2");

  try {
    createdProduct = new Product({
      name,
      description,
      price,
      stock,
      image,
      needsPrescription,
      category,
      pharmacy: pharmacyId,
      expiryDate: expiryDate,
    });
    await createdProduct.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Creating product failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ product: createdProduct });
});

// Remove product by id
router.post("/remove/:id", async (req, res, next) => {
  let product;
  const id = req.params.id;
  try {
    product = await Product.findOneAndRemove({ _id: id });
  } catch (err) {
    const error = new HttpError(
      "Removing product failed, please try again later.",
      500
    );
    console.log(err);
    return next(error);
  }
  res.json({
    product: product,
  });
});

// Edit product by id
router.put("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const { price, category, stock } = req.body;

    // Find the product by ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update the fields
    product.price = price;
    product.category = category;
    product.stock = stock;

    // Save the updated product
    await product.save();

    // Return the updated product
    console.log(product);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
