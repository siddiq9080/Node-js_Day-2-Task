import express from "express";
import { body, validationResult } from "express-validator";
import { v4 as uuid } from "uuid";
import { bookings } from "../local-db/booking.js";
import { rooms } from "../local-db/rooms.js";
const roomsRouter = express.Router();

// GET ( get all rooms data )

roomsRouter.get("/", (req, res) => {
  res.json(rooms);
});

// POST ( create a new room)

roomsRouter.post(
  "/",
  [
    body("number_of_seats").isInt({ gt: 0 }),
    body("amenties_in_room").isString(),
    body("price_for_1hour").isFloat({ gt: 0 }),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      const roomdata = req.body;

      rooms.push({
        room_id: uuid(),
        ...roomdata,
      });

      res.status(201).json({ msg: "room created successfully" });
    }
  }
);

// GET ( get a single room with "id" (path params) )

roomsRouter.get("/:room_id", (req, res) => {
  const { id } = req.params;
  const room = rooms.find((r) => r.id === id);

  if (room) {
    res.json(room);
  } else {
    res.status(404).json({ msg: "Room not available" });
  }
});

// PUT ( Edit a single room with help of "id" )

roomsRouter.put("/:room_id", (req, res) => {
  const updateData = req.body;

  const { id } = req.params;

  const roomIndex = rooms.findIndex((r) => r.id === id);

  if (roomIndex === -1) {
    res.status(404).json({ msg: "Room not found" });
  } else {
    rooms[roomIndex] = {
      id,
      ...updateData,
    };
    res.json({ msg: "updated room data" });
  }
});

// DELETE ( delete a single room with "id" (with path params) )

roomsRouter.delete("/:room_id", (req, res) => {
  const { room_id } = req.params;
  const roomIndex = rooms.findIndex((r) => r.room_id === room_id);

  if (roomIndex !== -1) {
    rooms.splice(roomIndex, 1);
    res.json({ msg: "Room deleted successfully" });
  } else {
    res.status(404).json({ msg: "Room not found" });
  }
});

// List All Rooms with Booking Data

roomsRouter.get("/bookings", (req, res) => {
  const roomsWithBookings = rooms.map((room) => {
    const booking = bookings.find((b) => b.room_id === room.room_id);

    return {
      room_name: room.room_name,
      booked_status: room.room_status,
      customer_name: booking ? booking.customer_name : null,
      date: booking ? booking.date : null,
      start_date: booking ? booking.start_time : null,
      end_date: booking ? booking.end_time : null,
    };
  });

  res.json(roomsWithBookings);
});

export default roomsRouter;
