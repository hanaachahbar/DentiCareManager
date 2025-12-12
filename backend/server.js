const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Import ALL routes
const patientsRoute = require("./routes/patients");
const paymentsRoute = require("./routes/payments");
const invoicesRoute = require("./routes/invoices");
const servicesRoute = require("./routes/services");
const appointmentsRoute = require("./routes/appointments");
const serviceDetailsRoute = require("./routes/serviceDetails");
const documentsRoute = require("./routes/documents");
const labsRoute = require("./routes/labs");
const labWorksRoute = require("./routes/labWorks");
const labServicesRoute = require("./routes/labService");
const medicationsRoute = require("./routes/medications")

// Route mappings
app.use("/api/patients", patientsRoute);
app.use("/api/payments", paymentsRoute);
app.use("/api/invoices", invoicesRoute);
app.use("/api/services", servicesRoute);
app.use("/api/appointments", appointmentsRoute);
app.use("/api/service-details", serviceDetailsRoute);
app.use("/api/documents", documentsRoute);
app.use("/api/labs", labsRoute);
app.use("/api/lab_works", labWorksRoute);
app.use("/api/labService", labServicesRoute);
app.use("/api/medications", medicationsRoute);

// Root endpoint
app.get("/", (req, res) => {
  res.send("SQL Backend API is running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));