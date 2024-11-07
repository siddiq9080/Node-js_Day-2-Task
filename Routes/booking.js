import express from "express";
import { v4 as uuid } from "uuid";
import { bookings } from "../local-db/booking.js";
import { rooms } from "../local-db/rooms.js";

const bookingsRouter = express.Router();

// GET ( get all rooms )

bookingsRouter.get("/", (req, res) => {
  res.json(bookings);
});

// POST (create a booking room)

bookingsRouter.post("/", (req, res) => {
  const { room_id, customer_name, date, start_time, end_time } = req.body;

  const isRoomBooked = bookings.some(
    (booking) =>
      booking.room_id === room_id &&
      booking.date === date &&
      ((start_time >= booking.start_time && start_time < booking.end_time) ||
        (end_time > booking.start_time && end_time <= booking.end_time))
  );

  if (isRoomBooked) {
    return res
      .status(400)
      .json({ msg: "Room is already booked for the selected date and time." });
  }

  const newBooking = {
    booking_id: uuid(),
    customer_name,
    date,
    start_time,
    end_time,
    room_id,
    Room_booking_hours:
      Math.abs(new Date(end_time) - new Date(start_time)) / 36e5, // Calculate hours
  };

  bookings.push(newBooking);
  res
    .status(201)
    .json({ msg: "Booking created successfully", booking: newBooking });
});

// GET ( get a single room with "id" (path params ))

bookingsRouter.get("/:booking_id", (req, res) => {
  const booking = bookings.find((b) => b.booking_id === req.params.booking_id);
  if (booking) {
    res.json(booking);
  } else {
    res.status(404).json({ msg: "Booking not found" });
  }
});

// PUT (edit a single booking)
bookingsRouter.put("/:booking_id", (req, res) => {
  const bookingIndex = bookings.findIndex(
    (f) => f.booking_id === req.params.booking_id
  );

  if (bookingIndex === -1) {
    return res.status(404).json({ msg: "Booking not found" });
  }

  const updatedBooking = { ...bookings[bookingIndex], ...req.body };
  bookings[bookingIndex] = updatedBooking;
  res.json({ msg: "Booking updated successfully", booking: updatedBooking });
});

// DELETE (delete a single booking)
bookingsRouter.delete("/:booking_id", (req, res) => {
  const bookingIndex = bookings.findIndex(
    (b) => b.booking_id === req.params.booking_id
  );

  if (bookingIndex === -1) {
    return res.status(404).json({ msg: "Booking not found" });
  }

  bookings.splice(bookingIndex, 1);
  res.json({ msg: "Booking deleted successfully" });
});

// List All Customers with Booking Data
bookingsRouter.get("/customers", (req, res) => {
  const customersWithBookings = bookings.map((booking) => {
    const room = rooms.find((r) => r.room_id === booking.room_id);

    return {
      customer_name: booking.customer_name,
      room_name: room ? room.room_name : null,
      date: booking.date,
      start_time: booking.start_time,
      end_time: booking.end_time,
    };
  });

  res.json(customersWithBookings);
});

// List How Many Times a Customer Has Booked a Room

bookingsRouter.get("/customers/count", (req, res) => {
  const customerBookingCounts = bookings.reduce((acc, booking) => {
    const room = rooms.find((r) => r.room_id === booking.room_id);

    if (!acc[booking.customer_name]) {
      acc[booking.customer_name] = {
        customer_name: booking.customer_name,
        bookings: [],
      };
    }

    acc[booking.customer_name].bookings.push({
      room_name: room ? room.room_name : null,
      date: booking.date,
      start_time: booking.start_date,
      end_time: booking.end_date,
      booking_id: booking.id,
      booking_date: booking.date,
      booking_status: "confirmed",
    });

    return acc;
  }, {});

  const response = Object.values(customerBookingCounts).map((customer) => ({
    customer_name: customer.customer_name,
    booking_count: customer.bookings.length,
    bookings: customer.bookings,
  }));

  res.json(response);
});

export default bookingsRouter;
