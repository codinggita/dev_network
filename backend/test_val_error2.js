const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    leader: { type: String, required: true },
    members: [String],
    joinRequests: [String],
    invites: [String],
    projects: [String]
}, { strict: false }); // adding strict false just in case

const Team = mongoose.model("Team", teamSchema);

async function testLeave() {
    await mongoose.connect(process.env.MONGO_URI);
    try {
        const team = await Team.findOne();
        if(!team) { console.log("No team available"); process.exit(0); }
        
        team.members = ["dummy1@example.com", "dummy2@example.com"];
        await team.save();
    } catch(err) {
        fs.writeFileSync("val_error.json", JSON.stringify(err.errors, null, 2));
    }
    process.exit(0);
}
testLeave();
