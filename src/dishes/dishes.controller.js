const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function create(req,res){
  const {data: {id, name, description, price, image_url} = {}} = req.body
  const dataId = nextId()
  const newDish = {
    id: dataId,
    name: req.body.data.name,
    description: req.body.data.description,
    price: req.body.data.price,
    image_url: req.body.data.image_url
  }
  dishes.push(newDish)
  res.status(201).json({data: newDish})
}

function read(req,res,next){
  const foundDish = res.locals.dish
  if(foundDish){
    res.json({data: foundDish[0]})
  }
}

function doesDishExists(req,res,next){
  const dishId = req.params.dishId
  const foundDish = dishes.filter((dish)=> dish.id == dishId)
  if (foundDish.length > 0){
    res.locals.dish = foundDish
    next()
  }else{
    next({status: 404, message: `Dish ${dishId} not found.`})
  }
}

function dataMatchDish(req,res,next){
     const {data: {id} = {}} = req.body
     const dishId = req.params.dishId
     if (id !== null && id !== "" && id !== dishId && id !== undefined){
       next({status: 400, message: `id ${id} must match dataId provided in parameters`})
     }
  return next()
}

function urlValid(req,res,next){
  const {data: image_url} = req.body
  const reqUrl = req.body.data.image_url
  if (reqUrl == null || reqUrl == undefined || reqUrl ==""){
    next({status:400, message: "Dish must include an image_url."})
  }
  next()
}

function doesNameExists(req,res,next){
  const {data:{name}={}} = req.body
  if(name){
    res.locals.name = name
    return next()
  }else{
    next({status: 400,
         message: "Dish must include a name."})
  }
}

function doesDescriptionExists(req,res,next){
  const {data: {description} = {}} = req.body
  if (description){
    res.locals.description = description
  }
  next({status: 400, message: "Dish must include a description."})
}

function isDescriptionValid(req,res,next){
  const {data: {description} = {}} = req.body
  const reqDes = req.body.data.description
  if(reqDes == "" || reqDes == null || reqDes == undefined){
    next({status: 400, message: "Dish must include a description."})
  }
  next()
}




function isPriceValid(req,res,next){
  const {data: {price}= {}} = req.body
  const reqPrice = req.body.data.price 
  if(reqPrice == null || reqPrice == undefined || reqPrice == ""){
    next({status: 400, message: "Dish must include a price."})
  }
  if(typeof reqPrice == 'number' && reqPrice > 0){return next()}else{
    next({status: 400, message: "The price must be greater than 0."})
  }
}

function isNameValid(req,res,next){
  const {data:name} = req.body
  const  reqName = req.body.data.name
  if(reqName == "" || !reqName){
    next({status: 400, message: "Dish must include a name."})
  }
  next()
}

function update(req,res){
  dishId = req.params.dishId
  let {data:{name,description, price,image_url},} = req.body
  let updateDish = {
    id:dishId,
    name: req.body.data.name,
    description: req.body.data.description,
    price: req.body.data.price,
    image_url: req.body.data.image_url,
  }
  return res.json({data:updateDish})
}

function list(req,res){
  res.json({data: dishes})
}


module.exports = {
  list, 
  create: [
    isNameValid,
    isPriceValid,
    isDescriptionValid,
    urlValid,
    create
  ],
  read: [doesDishExists, read],
  update: [
    doesDishExists,
    dataMatchDish,
    doesNameExists,
    isNameValid,
    isPriceValid,
    isDescriptionValid,
    urlValid,
    update
  ]
}

