//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://anjali_nair:anjuditu@cluster0.ehdiz.mongodb.net/todolistDB",{useNewUrlParser:true});
 const itemsScheema ={
   name:String
 }
 const Item = mongoose.model("item",itemsScheema);

 const item1=new Item({
   name:"Welcome"
 });
 const item2=new Item({
   name:"Do DWDM"
 });
 const item3=new Item({
   name:"Do HPC"
 });
 
 const defaultItems = [item1,item2,item3];
const listSchema = {
  name:String,
  items:[itemsScheema]
};

 const List = mongoose.model("List",listSchema);


 
app.get("/", function(req, res) {

const day = date.getDate();
  Item.find({},function(err,foundItems) {

    if(foundItems.length===0)
    {
      Item.insertMany(defaultItems,function(err){
   if(err)
   {
     console.log(err);
   }
   else{
     console.log("success");
   }
     });
   res.redirect("/");
    }
   else{
      res.render("list", {listTitle:day, newListItems:foundItems });

   }
 
});
});

app.post("/", function(req, res){


  const day = date.getDate();
  const itemName = req.body.newItem;
  const listName=req.body.list;

  const item = new Item({
    name:itemName
  });

  if(listName === day){
  item.save();
  res.redirect("/");
  }
  else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }

  

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req, res){

  const day = date.getDate();
  const checkedItemId = req.body.checkbox;
  const listName=req.body.listName;

  if(listName===day)
  {
     Item.findByIdAndRemove(checkedItemId, function(err){
    if(!err)
    {
      console.log("Deleted");
      res.redirect("/");
    }
  });
  }
  else {

    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
        if(!err)
        {
          res.redirect("/"+listName);
        }
    });

  }
  
});

app.get("/:customListName",function(req, res){

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList) {
    if(!err){
      if(!foundList)
      {
        //Create a new list
        const list = new List( {
        name:customListName,
        items:defaultItems
      });

       list.save();
       res.redirect("/" + customListName);

      }
      else{
        //show an existing list
      res.render("list", {listTitle: foundList.name, newListItems:foundList.items });   
         }
  }
});
  
 
});


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null | port == "")
{
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started ");

});
