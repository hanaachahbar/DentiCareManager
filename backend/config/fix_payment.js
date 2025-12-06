// fix-payment-table.js
// This will fix the Payment table structure

const db = require("./db");

console.log("🔧 Starting Payment table fix...\n");

db.serialize(() => {
  // Step 1: Check current structure
  db.all("PRAGMA table_info(Payment)", (err, columns) => {
    if (err) {
      console.error("❌ Error checking table:", err.message);
      db.close();
      return;
    }

    console.log("Current Payment table columns:");
    columns.forEach(col => console.log(`  - ${col.name}`));
    console.log("");

    // Step 2: Backup existing data (if any)
    db.all("SELECT * FROM Payment", (err, data) => {
      if (err) {
        console.log("⚠️  No existing data to backup (table might not exist)");
      } else {
        console.log(`📦 Found ${data.length} existing payment records`);
      }

      // Step 3: Drop the table with all dependencies
      console.log("\n🗑️  Dropping Payment table...");
      
      db.run("PRAGMA foreign_keys = OFF", (err) => {
        if (err) console.error("Error disabling foreign keys:", err.message);

        // Drop dependent tables first
        db.run("DROP TABLE IF EXISTS Invoices", (err) => {
          if (err) console.error("Error dropping Invoices:", err.message);
          else console.log("  ✓ Dropped Invoices table");

          db.run("DROP TABLE IF EXISTS Payment", (err) => {
            if (err) {
              console.error("❌ Error dropping Payment:", err.message);
              db.close();
              return;
            }
            console.log("  ✓ Dropped Payment table");

            // Step 4: Recreate tables with correct schema
            console.log("\n🔨 Recreating tables...");

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
                db.close();
                return;
              }
              console.log("  ✓ Created Payment table");

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
                  console.log("  ✓ Created Invoices table");
                }

                // Re-enable foreign keys
                db.run("PRAGMA foreign_keys = ON", (err) => {
                  if (err) console.error("Error enabling foreign keys:", err.message);
                  else console.log("\n✓ Foreign keys re-enabled");

                  // Verify the fix
                  db.all("PRAGMA table_info(Payment)", (err, newColumns) => {
                    if (err) {
                      console.error("❌ Error verifying:", err.message);
                    } else {
                      console.log("\n✅ Payment table now has these columns:");
                      newColumns.forEach(col => {
                        console.log(`  - ${col.name} (${col.type})`);
                      });
                      console.log("\n🎉 Fix completed! You can now create services.");
                    }
                    db.close();
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});