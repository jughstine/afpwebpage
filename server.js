const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const serviceAccount = require("./afppgmc-82e1e-firebase-adminsdk-r0l2w-4aeaea1688.json");

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Root route for '/'
app.get("/", (req, res) => {
    res.send("Node server is running!");
});

// Delete user route
app.delete("/deleteUser/:uid", async (req, res) => {
    const { uid } = req.params;
    try {
        await admin.auth().deleteUser(uid);
        res.status(200).send(`User with UID ${uid} deleted successfully.`);
    } catch (error) {
        console.error("Error deleting user:", error.message);
        res.status(500).send(`Failed to delete user: ${error.message}`);
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
