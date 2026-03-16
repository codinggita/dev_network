const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    leader: { type: String, required: true },
    members: [String],
    joinRequests: [String],
    invites: [String],
    projects: [String]
});

const Team = mongoose.model("Team", teamSchema);

async function testLeave() {
    await mongoose.connect(process.env.MONGO_URI);
    try {
        const team = await Team.findOne();
        if(!team) { console.log("No team available"); process.exit(0); }
        console.log("Team found:", team.name);
        
        team.members = ["dummy1@example.com", "dummy2@example.com"];
        await team.save();
        console.log("Saved successfully");
    } catch(err) {
        console.error("VALIDATION FAILED:");
        if (err.errors) {
            console.dir(err.errors, { depth: null });
        } else {
            console.error(err);
        }
    }
    process.exit(0);
}
testLeave();
