const express = require("express");
const cors=require("cors");


const { getUnsplashPhoto } = require("./services");
const { MongoClient, ObjectId } = require("mongodb");

const server = express();
server.use(express.json());
server.use(cors());
server.use(express.urlencoded({ extended: true}));

const MongoDB_URL= "mongodb+srv://zoej569:Zoe596391_@cluster0.ayyws.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
const client = new MongoClient(MongoDB_URL);
const dbName = "first mongodb";

client.connect()
.then(()=>{
  const db= client.db("first_mongodb")

  const destinations = db.collection("destinations") // create a destinations collection on my database
  
  let PORT = process.env.PORT || 3000;
server.listen(PORT, function(){
  console.log(`Server listening on PORT ${PORT}`);
});

// POST => create destinations
// data => {name^, location^, photo, description}
server.post("/destinations", async (req, res) => {
  const { name, location, description } = req.body;

  // Make sure we have a name AND location
  if (
    name === undefined ||
    name.length === 0 ||
    location === undefined ||
    location.length === 0
  ) {
    return res
      .status(400)
      .json({ message: "Name and Location are both required" });
  }

  const dest = { name, location };

 

  dest.photo = await getUnsplashPhoto({name,location});

  if (description && description.length !== 0) {
    dest.description = description;
  }

  destinations.insertOne(dest);

  res.redirect("/destinations");
});

// GET => read destinations
// accepts the follow query parameters
// continent
server.get("/destinations", async (req, res) => {
  const data = await destinations.find({}).toArray();
  res.send(data);
});

// PUT => edit a destination
server.put("/destinations/", async (req, res) => {
  const { id, name, location, description } = req.body;

  if (id === undefined) {
    return res.status(400).json({ message: "id is required" });
  }

  if (name !== undefined && name.length === 0) {
    return res.status(400).json({ message: "Name can't be empty" });
  }

  if (location !== undefined && location.length === 0) {
    return res.status(400).json({ message: "Location can't be empty" });
  }
    
const newDest = {
  name:name,
  location:location,
  photo: await getUnsplashPhoto({
    name:name,
    location:location,
  })
};
     
      if (description !== undefined) {
        newDest.description = description;
      }


     const updateDest=await destinations.updateOne(
       {_id:ObjectId(id)},
       {$set: newDest});

      return res.json(updateDest);
      
  
});

// DELETE => delete a destination
// HOW TO GET THE ID from the reqs
// route parameters /destinations/:id => req.params.id
// query /destinations?id=198745 => req.query.id
server.delete("/destinations/:id", async (req, res) => {
  const destId = req.params.id;

  const newDestinations = destinations.filter((dest) => dest.id !== destId);

  destinations = newDestinations;
 // const deleteResult= await destinations.deleteOne({_id: destId});
 // console.log("Deleted documents=>", deleteResult);
  res.redirect(303,"/destinations");

});

})

