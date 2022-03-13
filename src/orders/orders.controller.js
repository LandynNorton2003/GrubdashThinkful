const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass



function validId(req,res,next){
  let {data: {id}} = req.body
  const orderId = req.params.orderId
  const idData = req.body.data.id
  if(idData == null || idData == undefined || idData == ""){return next()}
  if(idData !== orderId){
    next({status: 400, message: `Order id does not match route id. Order: ${id}, Route`})
  }else{next()}
}

function doesOrderExists(req,res,next){
  const orderId = req.params.orderId
  const foundOrder = orders.filter((order)=> order.id == orderId)
  if( foundOrder.length > 0){
    res.locals.order = foundOrder
    next()
  }else{next({status: 404, message: `Order ${orderId} not found.`})}
}

function validStatus(req,res,next){
  try{
  const {data: {status} = {}} = req.body
  if(status !== ("pending" || "out-for-deliver" || "preparing" || "delivered")){
    next({status: 400, message: "Order must have a status of pending, preparing, out-for-delivery, delivered."})
  }
  if(status == "delivered"){
    return next({status: 400, message:"A delivered order cannot be changed."})
  }
  next()
  }catch(e){console.log(`ERROR =${e}`)}
}

function validCreate(req,res,next){
  const {deliverTo, mobileNumber, dishes} = req.body.data
  if(!deliverTo){
    next({status:400, message: "Order must include a deliverTo."})
  }
  if(!dishes){next({status:400, message: "Order must include a dish."})}
  if(!mobileNumber){next({status:400, message:"Order must include a mobileNumber."})}
  if(!Array.isArray(dishes) || !dishes.length > 0){
    return next({status: 400, message: `Dishes must include at least one dish.`})
  }
  dishes.map((dish, index)=>{
    if(!Number.isInteger(dish.quantity) || !dish.quantity || !dish.quantity > 0){
      return next({status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0.`})
    }
  })
  res.locals.order = req.body.data 
  next()
}

function create(req,res){
  const newOrder = {...res.locals.order, id: nextId()}
  orders.push(newOrder)
  res.status(201).json({data: newOrder})
}

function update(req,res){
  const orderId = req.params.orderId
  let {data: id, deliverTo, mobileNumber, status, dishes} = req.body
  let updatedOrder = {
    id: orderId,
    deliverTo: req.body.data.deliverTo,
    mobileNumber: req.body.data.mobileNumber,
    status: req.body.data.status,
    dishes: req.body.data.dishes,
  }
  return res.json({data:updatedOrder})
}


function read(req,res,next){
  const foundOrder=res.locals.order
  if(foundOrder){
    res.json({data: foundOrder[0]})
  }
}

function list(req,res){
  res.json({data:orders})
}

function destroy(req,res,next){
  const orderId=req.params.orderId
  const foundOrder = res.locals.order
  const index = orders.find((order)=> order.id == Number(orderId))
  const toDelete = orders.splice(index, 1)
  if(foundOrder[0].status == "pending"){
    res.sendStatus(204)
  }
  next({status: 400, message:"An order cannot be deleted unless it is pending."})
}

module.exports = {
  create: [validCreate, create],
  update: [validCreate, doesOrderExists, validId, validStatus, update],
  read: [doesOrderExists, read],
  destroy: [doesOrderExists, destroy],
  list,
}









