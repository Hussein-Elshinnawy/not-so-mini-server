const { Product } = require("../models/product");
const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const bodyParser = require("body-parser");
const multer = require("multer");
const mongoose = require('mongoose');
router.use(bodyParser.json());

const FILE_TYPE_MAP = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
  'image/png': 'png'
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid image type');

    if(isValid) {
        uploadError = null
    }
    cb(uploadError, 'D:/3.work/not-so-mini/not-so-mini-server/images/upload');
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fieldname= file.originalname.replace(' ','-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fieldname}-${Date.now()}.${extension}`)
  }
})

const uploadImages = multer({ storage: storage });

router.get(`/`, async (req, res) => {
  let filter = {};
  if(req.query.categories)
  {
       filter = {category: req.query.categories.split(',')}
  }

  Product.find(filter)
    .populate("category")
    .then((productList) => {
      return res.send(productList);
    })
    .catch((error) => {
      return res.status(500).send({ success: false, error: error });
    });
});

router.get(`/:id`, async (req, res) => {
  Product.findById(req.params.id)
    .populate("category", "-_id")
    .then((product) => {
      if (!product) {
        return res.status(400).send("no such product");
      }
      return res.send(product);
    })
    .catch((error) => {
      return res.status(500).send({ success: false, error: error });
    });
});

router.post(`/`, uploadImages.single('image'), async (req, res) => {
  const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('no such Category')

    const file = req.file;
    if(!file) return res.status(400).send('No image in the request')

    const fileName = file.filename
    const basePath = `${req.protocol}://${req.get('host')}/images/upload/`;
          let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        price: req.body.price,
        image: `${basePath}${fileName}`,
        images: req.body.images,
        numberInStock: req.body.numberInStock,
        category: req.body.category,
        rating: req.body.rating,
        isAvailable: req.body.isAvailable,
      });

    product = await product.save();

    if(!product) 
    return res.status(500).send('The product cannot be created')

    res.send(product);
 
});

router.put(`/:id`, (req, res) => {
  Category.findById(req.body.category)
    .then((category) => {
      if (!category) {
        return res.status(400).send("Invalid Category");
      }
      Product.findByIdAndUpdate(
        req.params.id,
        {
          name: req.body.name,
          description: req.body.description,
          richDescription: req.body.richDescription,
          price: req.body.price,
          image: req.body.image,
          images: req.body.images,
          numberInStock: req.body.numberInStock,
          category: req.body.category,
          rating: req.body.rating,
          isAvailable: req.body.isAvailable,
        },
        { new: true } // this to get the update product not the old one
      )
        .then((product) => {
          if (!product) {
            return res.status(400).send("no such product");
          }
          return res.send(product);
        })
        .catch((error) => {
          return res.status(500).send({ success: false, error: error });
        });
    })
    .catch((error) => {
      return res.status(500).send({ success: false, error: error });
    });
});

router.delete(`/:id`, (req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, messgae: "product deleted successfully " });
      } else {
        return res
          .status(400)
          .json({ success: false, messgae: "no such product" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.get(`/get/count`, async (req, res) => {
  Product.countDocuments()
    .then((productCount) => {
      return res.send({
        productCount: productCount,
      });
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });

});


router.put(
  '/gallery-images/:id', 
  uploadImages.array('images', 5), 
  async (req, res)=> {
      if(!mongoose.isValidObjectId(req.params.id)) {
          return res.status(400).send('Invalid Product Id')
       }
       console.log('hasbik');
       const files = req.files
       let imagesPaths = [];
       const basePath = `${req.protocol}://${req.get('host')}/images/upload/`;

       if(files) {
          files.map(file =>{
              imagesPaths.push(`${basePath}${file.filename}`);
          })
       }

       const product = await Product.findByIdAndUpdate(
          req.params.id,
          {
              images: imagesPaths
          },
          { new: true}
      )

      if(!product)
          return res.status(500).send('the gallery cannot be updated!')

      res.send(product);
  }
)
module.exports = router;
