import http from "http";
import path from "path";
import { Server } from "socket.io";
import express from "express";

const app = express();
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "/frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/frontend/build/index.html"));
});

const httpServer = http.Server(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
const users = [];
io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    const user = users.find((x) => x.socketId === socket.id);
    if (user) {
      user.online = false;
      const admin = users.find((x) => x.name === "Admin" && x.online);
      if (admin) {
        io.to(admin.socketId).emit("updateUser", user);
      }
    }
  });
  socket.on("onLogin", (user) => {
    const updatedUser = {
      ...user,
      online: true,
      socketId: socket.id,
      message: [],
    };

    const existUser = users.find((x) => x.name === updatedUser.name);
    if (existUser) {
      existUser.socketId = socket.id;
      existUser.online = true;
    } else {
      users.push(updatedUser);
    }
    const admin = users.find((x) => x.name === "Admin" && x.online);
    if (admin) {
      io.to(admin.socketId).emit("updateUser", updatedUser);
    }
    if (updatedUser.name === "Admin") {
      io.to(updatedUser.socketId).emit("listusers", users);
    }
  });
  socket.on("onUserSelected", (user) => {
    const admin = users.find((x) => x.name === "Admin" && x.online);
    if (admin) {
      const existUser = users.find((x) => x.name === user.name);
      io.to(admin.socketId).emit("selectUser", existUser);
    }
  });
  socket.on("onMessage", (message) => {
    if (message.from === "Admin") {
      const user = users.find((x) => x.name === message.to && x.online);
      if (user) {
        io.to(user.socketId).emit("message", message);
        user.message.push(message);
      } else {
        io.to(socket.id).emit("message", {
          from: "System",
          to: "Admin",
          body: "온라인이 아닙니다",
        });
      }
    } else {
      const admin = users.find((x) => x.name === "Admin" && x.online);
      if (admin) {
        io.to(admin.socketId).emit("message", message);
        const user = users.find((x) => x.name === message.from && x.online);
        if (user) {
          user.message.push(message);
        }
      } else {
        io.to(socket.id).emit("message", {
          from: "System",
          to: message.from,
          body: "지금 관리자가 온라인이 아닙니다",
        });
      }
    }
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`server started at http://localhost:${PORT}`);
});