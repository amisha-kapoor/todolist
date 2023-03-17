//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const { Schema } = mongoose;
const _ = require("lodash");

const PORT=process.env.PORT || 3000;
mongoose.set('strictQuery', false);
const connectDB = async()=>{
  try{
    const conn=await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`)
  }catch(error){
console.log(error)
process.exit(1)
  }
}

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.set('strictQuery', false);
// mongoose.connect("mongodb+srv://amy:xyz321A&S@cluster0.nsrt4xf.mongodb.net/todolistDB");
// mongoose.connect('mongodb://127.0.0.1:27017/todolistDB', { useNewUrlParser: true});


const itemsSchema ={
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1=new Item({
  name:"Welcome to your to-do list!"
});

const item2=new Item({
  name:"Hit the + button to add a new item!"
});

const item3=new Item({
  name:" Hit the checkbox to delete an item!"
});

const defaultItems = [item1, item2, item3];

const listSchema={
  name:String,
  items:[itemsSchema]
}

const List=mongoose.model("List",listSchema);

app.get("/", function (req, res) {

  Item.find({}).then(function(foundItems){
    if(foundItems.length==0){
      Item.insertMany(defaultItems)
      .then(function(items){
        console.log("SuccessFully save all the items to todolistDB");
      })
      .catch(function (err) {
        console.log(err);
        });
        res.redirect("/");
              } 
              else {
                res.render("list", {
                  listTitle: "Today",
                  newListItems: foundItems,
                });
              }
         
            })
          });      
          
          app.get("/:customListName", function (req, res) {
            const customListName = _.capitalize(req.params.customListName);
           
            List.findOne({ name: customListName })
              .then(function (foundList) {
                if (!foundList) {
                  const list = new List({
                    name: customListName,
                    items: defaultItems,
                  });
                  list.save();
                  res.redirect("/" + customListName);
                } else {
                  res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items,
                  });
                }
              })
              .catch(function (err) {
                console.log(err);
              });
          });


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list
const item= new Item({
  name:itemName
});

if(listName==="Today"){
  item.save()
    res.redirect("/");  
}else{
  List.findOne({name: listName})
  .then(function(foundList){
    // if(foundList){
    foundList.items.push(item);
    foundList.save()
    res.redirect("/"+listName)}
  // }
  )}

});


app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox.trim();
  const listName=req.body.listName.trim();

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId).then(function(foundItem){Item.deleteOne({_id: checkedItemId})})
 
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkedItemId}}})
    .then(function(foundList){
      res.redirect("/"+listName);
    })
  }
 
  
 })



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

connectDB().then(()=>{
  app.listen(PORT,()=>{
    console.log(`Server started on port ${PORT}`);
  })
})
