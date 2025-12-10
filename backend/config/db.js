const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const initializeTables = require("./initTables");

// Database file (will be created automatically if it doesn't exist)
const dbPath = path.resolve(__dirname, "../dentiCare.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if(err) {
    return console.error("Failed to connect to SQLite:", err.message);
  }
  console.log("Connected to SQLite database!");
  
  // Step 1: Initialize all tables first
  initializeTables(db);
  
  // Step 2: After tables are created, run the Payment table fix
  // Wait 2 seconds to ensure all tables are created
  setTimeout(() => {
    console.log("\n🔧 Checking if Payment table needs fixing...");
    
    db.serialize(() => {
      db.all("PRAGMA table_info(Payment)", (err, columns) => {
        if (err) {
          console.error("❌ Error checking Payment table:", err.message);
          return;
        }

        // Check if service_id column exists
        const hasServiceId = columns.some(col => col.name === 'service_id');
        
        if (!hasServiceId) {
          console.log("⚠️  Payment table needs fixing. Running fix script...\n");
          runPaymentTableFix(db);
        } else {
          console.log("✅ Payment table structure is correct!");
        }
      });
    });
  }, 2000);
});

// Function to fix Payment table structure
function runPaymentTableFix(db) {
  db.serialize(() => {
    // Check for existing data
    db.all("SELECT * FROM Payment", (err, data) => {
      if (!err && data.length > 0) {
        console.log(`📦 Found ${data.length} existing payment records`);
      }

      console.log("🗑️  Dropping Payment and Invoices tables...");
      
      db.run("PRAGMA foreign_keys = OFF", (err) => {
        if (err) console.error("Error disabling foreign keys:", err.message);

        // Drop Invoices first (it depends on Payment)
        db.run("DROP TABLE IF EXISTS Invoices", (err) => {
          if (!err) console.log("  ✓ Dropped Invoices table");

          db.run("DROP TABLE IF EXISTS Payment", (err) => {
            if (err) {
              console.error("❌ Error dropping Payment:", err.message);
              return;
            }
            console.log("  ✓ Dropped Payment table");

            console.log("\n🔨 Recreating tables with correct schema...");

            // Recreate Payment with service_id
            const createPaymentTable = `
              CREATE TABLE Payment (
                payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                service_id INTEGER UNIQUE,
                total_amount REAL NOT NULL,
                paid_amount REAL DEFAULT 0,
                status TEXT DEFAULT 'unpaid' CHECK(status IN ('unpaid', 'partially_paid', 'completed')),
                description TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (service_id) REFERENCES Services(service_id) ON DELETE CASCADE
              )
            `;

            db.run(createPaymentTable, (err) => {
              if (err) {
                console.error("❌ Error creating Payment table:", err.message);
                return;
              }
              console.log("  ✓ Created Payment table with service_id");

              // Recreate Invoices with appointment_id
              const createInvoicesTable = `
                CREATE TABLE Invoices (
                  invoice_id INTEGER PRIMARY KEY AUTOINCREMENT,
                  payment_id INTEGER,
                  appointment_id INTEGER UNIQUE,
                  amount REAL NOT NULL,
                  description TEXT,
                  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (payment_id) REFERENCES Payment(payment_id) ON DELETE CASCADE,
                  FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id) ON DELETE CASCADE
                )
              `;

              db.run(createInvoicesTable, (err) => {
                if (err) {
                  console.error("❌ Error creating Invoices table:", err.message);
                } else {
                  console.log("  ✓ Created Invoices table with appointment_id");
                }

                // Re-enable foreign keys
                db.run("PRAGMA foreign_keys = ON", (err) => {
                  if (err) {
                    console.error("Error enabling foreign keys:", err.message);
                  } else {
                    console.log("\n✓ Foreign keys re-enabled");
                  }

                  // Verify the structure
                  db.all("PRAGMA table_info(Payment)", (err, newColumns) => {
                    if (!err) {
                      console.log("\n✅ Payment table final structure:");
                      newColumns.forEach(col => {
                        console.log(`  - ${col.name} (${col.type})`);
                      });
                      console.log("\n🎉 Database setup completed! Ready to create invoices.");
                    }
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

module.exports = db;
