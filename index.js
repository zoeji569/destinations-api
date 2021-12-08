const express = require("express");
const cors=require("cors");

const { redirect } = require("statuses");
let { destinations } = require("./db");
const { generateUniqueId, getUnsplashPhoto } = require("./services");

const server = express();
server.use(express.json());
server.use(cors());


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

  const dest = { id: generateUniqueId(), name, location };

 

  dest.photo = await getUnsplashPhoto({name,location});

  if (description && description.length !== 0) {
    dest.description = description;
  }

  destinations.push(dest);

  res.redirect("/destinations");
});

// GET => read destinations
// accepts the follow query parameters
// continent
server.get("/destinations", (req, res) => {
  res.send(destinations);
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

  for (const dest of destinations) {
    if (dest.id === id) {
      if (name !== undefined) {
        dest.name = name;
      }

      if (location !== undefined) {
        dest.location = location;
      }

      if(name !==undefined || location !== undefined){
        dest.photo = await getUnsplashPhoto({
          name:dest.name,
          location:dest.location
        })
      }
     
      if (description !== undefined) {
        dest.description = description;
      }

      return res.json(dest);
      
    }
  }
});

// DELETE => delete a destination
// HOW TO GET THE ID from the reqs
// route parameters /destinations/:id => req.params.id
// query /destinations?id=198745 => req.query.id
server.delete("/destinations/:id", (req, res) => {
  const destId = req.params.id;

  const newDestinations = destinations.filter((dest) => dest.id !== destId);

  destinations = newDestinations;

  res.redirect(303,"/destinations");
});
