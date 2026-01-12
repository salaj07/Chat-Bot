require('dotenv').config()
const app=require('./src/app')
const { createServer } = require("http");
const { Server } = require("socket.io");
const generateResponse=require('./src/service/ai.service')

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors:{
    origin:"http://localhost:5173"
  
  }
});

const chatHistory=[]

io.on("connection", (socket) => {
    console.log("User connected");
    
  socket.on("disconnect",()=>{
    console.log("User Disconnected");
    
  })

  socket.on("ai-message",async (data)=>{

    console.log("received AI message",data);
    
      chatHistory.push({
        role:"user",
        parts:[{text:data}]
      })
console.log(chatHistory[0].parts);

const response=await generateResponse(chatHistory);

// console.log(chatHistory[1].parts);

      chatHistory.push({
        role:"model",
        parts:[{text:response}]
      })


      socket.emit("ai-message-response",response)
  
  })

});
httpServer.listen(3001,()=>{
    console.log("server started");
    
}) 