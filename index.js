const express=require("express");
const fetch = require("node-fetch");
const server=express();
let {destinations}=require("./db");
const {generateUniqueId}=require("./services");
const cors = require("cors");
server.use(express.json());  //allows the server to parse body to json
server.use(cors());

let PORT= process.env.PORT || 3000;
server.listen(PORT,function(){
    console.log("Server listen on PORT 3000");
}); // listen to port 3000

server.get("/destinations",(req,res)=>{
    res.send(destinations);
})

server.post("/destinations", async (req,res)=>{
    const {name,location,description} = req.body; //destructure body

    if(name===undefined || 
       name.length===0 ||
       location === undefined ||
       location.length ===0
       )
    {
       return res.status(400).json({message: "Name and location are both required"});
    }

    const dest= {id:generateUniqueId(), name, location};
    const UNSPLASH_URL = `https://api.unsplash.com/photos/random?client_id=bov0CB5rjCu3qiEZpgq9QgMsionOXLhpj6-VNtsjfVs&q=${name}%20${location}`;
    
    const fetchRes = await fetch(UNSPLASH_URL);
    const data = await fetchRes.json();

    dest.photo = data.urls.small;

    if (description && description.length !== 0) {
    dest.description = description;
  }
    
    destinations.push(dest);

    res.redirect("/destinations");
    
});

server.delete("/destinations/:id",(req,res)=>{

    const destId = req.params.id;
    
    const newDestinations = destinations.filter((dest) => dest.id !== destId);

    destinations = newDestinations;
    
    res.redirect("/destinations");

});


server.put("/destinations/",(req,res)=>{
    
    const {id, name, location, photo, description} = req.body;
    if(id===undefined){
        return res.status(400).json({message: "id is required"});
    }
    
    if(name&&name.length===0){
        return res.status(400).json({message: "Name can't be empty"})
    }
    if(location&&location.length===0){
        return res.status(400).json({message: "Location can't be empty"})
    }
    
    for (const dest of destinations){
        if(dest.id===id){
            if(name){
                dest.name=name;
            }
            if(location){
                dest.location=location;
            }
            if(photo){
                dest.photo=photo;
            }
            if(description){
                dest.description=description;
            }

            return res.json(dest);
        }
    }
    
})