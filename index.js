const express = require("express");
const socketio = require("socket.io");
const path = require("path")
const app = express();

app.get("/", (req, res) => {
	return res.sendFile(__dirname + "/index.html")
})

const server = app.listen(3000, () => {
	console.log("App started");
	initSocket(server);
});

const users = new Map();

function initSocket (server) {
	const io = new socketio.Server(server, {
		cors: {
			origin: "*"
		},
		path: "/socket"
	});

	io.on("connection", (socket) => {
		console.log("A Client connected");

		socket.on("user-identification", (data) => {
			if (data.name) {
				users.set(socket.id, { name: data.name, socket });

				socket.emit("welcome", {
					message: `${data.name}, You are now connected with us.`,
					sessionId: socket.id
				});

				socket.broadcast.emit("user-join", "An user joined");
			};
		});

		socket.on("user-new-message", (data) => {
			const currentUser = users.get(socket.id);

			if (!currentUser) {
				return;
			};
	
			if (data.content) {
				socket.broadcast.emit("user-new-message", {
					name: currentUser.name,
					content: data.content
				});
			};
		})
	});
};