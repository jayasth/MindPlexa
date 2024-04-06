"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var express_1 = require("express");
var cors_1 = require("cors");
var app = (0, express_1.default)();
var server = (0, http_1.createServer)(app);
var io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});
app.use((0, cors_1.default)());
io.on("connection", function (socket) {
    console.log("A user connected");
    socket.on("disconnect", function () {
        console.log("A user disconnected");
    });
    socket.on("joinProject", function (projectId) {
        socket.join(projectId);
        console.log("User joined project: ".concat(projectId));
    });
    socket.on("leaveProject", function (projectId) {
        socket.leave(projectId);
        console.log("User left project: ".concat(projectId));
    });
    socket.on("updateNode", function (data) {
        socket.to(data.projectId).emit("nodeUpdated", data);
    });
    socket.on("updateEdge", function (data) {
        socket.to(data.projectId).emit("edgeUpdated", data);
    });
    socket.on("addNode", function (data) {
        socket.to(data.projectId).emit("nodeAdded", data);
    });
    socket.on("addEdge", function (data) {
        socket.to(data.projectId).emit("edgeAdded", data);
    });
    socket.on("deleteNode", function (data) {
        socket.to(data.projectId).emit("nodeDeleted", data);
    });
    socket.on("deleteEdge", function (data) {
        socket.to(data.projectId).emit("edgeDeleted", data);
    });
});
app.use(function (err, req, res) {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});
var port = process.env.PORT || 3001;
server.listen(port, function () {
    console.log("Server is running on port ".concat(port));
});
