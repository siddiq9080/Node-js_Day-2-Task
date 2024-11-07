import express from "express";

// Importing routes
import roomsRouter from "./Routes/rooms.js";
import bookingsRouter from "./Routes/booking.js";

const server = express();

server.use(express.json());

// GET

server.get("/", (req, res) => {
  res.json({ msg: "hello from express" });
});

// POST

server.post("/", (req, res) => {
  res.status(201).json({ msg: "created successfully" });
});

//linking routes to server

server.use("/rooms", roomsRouter);
server.use("/bookings", bookingsRouter);

const PORT = 4500;

server.listen(PORT, () => {
  console.log("server listening on :", PORT);
});
