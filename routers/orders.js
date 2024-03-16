const { Order } = require("../models/order");
const express = require("express");
const router = express.Router();
const { OrderItem } = require("../models/order-item");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort("-dateOrdered")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        // select: "name category price",
        populate: {
          path: "category",
          //   select: "name _id",
        },
      },
    }); //newest to oldest

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

router.get(`/:id`, async (req, res) => {
  // const order = await Order.findById(req.params.id).populate('user','name').populate({path:'orderItems', populate:{path:'product', populate:'category', select:'name _id'}});
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        // select: "name category price",
        populate: {
          path: "category",
          //   select: "name _id",
        },
      },
    });

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});

router.post("/", async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItems) => {
      let newOrderItem = new OrderItem({
        quantity: orderItems.quantity,
        product: orderItems.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );
  const orderItemsIdAwait = await orderItemsIds;
  const totalPrices = await Promise.all(
    orderItemsIdAwait.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      const totalPrices = orderItem.product.price * orderItem.quantity;
      return totalPrices;
    })
  );
  const initialValue = 0;
  const totalPrice = totalPrices.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    initialValue
  );
  let order = new Order({
    orderItems: orderItemsIdAwait,
    shippingAddress: req.body.shippingAddress,
    totalPrice: totalPrice,
    status: req.body.status,
    user: req.body.user,
    dateOrdered: req.body.dateOrdered,
  });
  order = await order.save();

  if (!order) {
    return res.status(400).send("the order cannot be created!");
  }

  res.send(order);
});

router.put(`/:id`, async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true } // this to get the update product not the old one
  );

  if (!order) {
    res.status(500).json({ success: false });
  }
  res.send(order);
});

router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (order) {
      for (let orderIt of order.orderItem) {
        await OrderItem.findByIdAndDelete(orderIt);
      }
      return res
        .status(200)
        .json({ success: true, message: "Order deleted successfully" });
    } else {
      return res.status(400).json({ success: false, message: "No such order" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);

  if (!totalSales) {
    return res.status(400).send("The order sales cannot be generated");
  }

  res.send({ totalsales: totalSales.pop().totalsales });
});

router.get(`/get/count`, async (req, res) =>{
    Order.countDocuments()
    .then((orderCount) => {
      return res.send({
        orderCount: orderCount,
      });
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.get(`/get/userorders/:userid`, async (req, res) =>{
    const userOrderList = await Order.find({user: req.params.userid}).populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        }).sort({'dateOrdered': -1});

    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
})

module.exports = router;
