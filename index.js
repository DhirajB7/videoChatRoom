import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
//import {v4} from 'uuid'

// server details
const app = express();
const PORT = 4000;
const httpServer = createServer(app);
const options = {
  cors: {
    origin: "http://localhost:4000",
  },
};

//views
app.set("view engine", "ejs");
app.use(express.static("public"));

//end-points
app.get("/check", (req, res) => res.json({ status: "working" }));

app.get("/", (req,res) => {
    //res.redirect(`/${v4()}`) //variable room name 
    res.redirect(`/videoroom`) //fixed room name
})


app.get("/:room", (req,res) => {
    res.render('room',{roomId:req.params.room})
})

httpServer.listen(PORT, () => console.log(`started at port ${PORT}`));

//socket
const io = new Server(httpServer, options);

io.on('connection',socket => {
    socket.on("join",(roomId,userId) => {
        
        socket.join(roomId)

        socket.broadcast.to(roomId).emit("user-connected",userId)

        socket.on('disconnect',()=>{
            socket.broadcast.to(roomId).emit("user-disconnected",userId)
        })
    })
})

