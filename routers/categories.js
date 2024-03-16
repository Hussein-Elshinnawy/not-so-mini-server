const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();
// const mongoose = require("mongoose");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get(`/`, async (req, res) => {
  const categoryList = await Category.find();

  if (!categoryList) {
    res.status(500).json({ success: false });
  }
  res.send(categoryList);
});

// router.get('/:id', async (req, res) => {
//   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//     return res.status(400).send('no such product');
//   }

//   try {
//     const product = await Product.findById(req.params.id);
//     if (!product) {
//       return res.status(400).send('no such product');
//     }
//     return res.send(product);
//   } catch (error) {
//     return res.status(500).send({ success: false, error: error });
//   }
// });

router.get(`/:id`, async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(500).json({ success: false });
  }
  res.send(category);
});

router.put(`/:id`, async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      color: req.body.color,
    },
    { new: true }// this to get the update product not the old one
  );

  if (!category) {
    res.status(500).json({ success: false });
  }
  res.send(category);
});

router.post(`/`, async (req, res) => {
  let category = new Category({
    name: req.body.name,
    color: req.body.color,
  });
  category = await category.save();
  if (!category) return res.status(500).send("category is not created");

  res.send(category);
});

router.delete(`/:id`, (req, res) => {
  Category.findByIdAndDelete(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, messgae: "category deleted successfully " });
      } else {
        return res
          .status(400)
          .json({ success: false, messgae: "no such category" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

module.exports = router;
