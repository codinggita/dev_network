const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const userSchema = new mongoose.Schema({
    name:String,
    profilePhoto:String,
    username:String,
    email:String,
    password:String,
    age:Number,
    collegeName:String,
    city:String,
    state:String,
    skills:[String],
    github:String,
    twitter:String,
    leetcode:String,
    youtube:String,
    projects:[String],
    teamName: { type: String, default: null }
});

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    leader: { type: String, required: true },
    members: [String], // Array of emails of the members
    joinRequests: [String], // Array of emails requesting to join
    invites: [String], // Array of emails that the leader has invited
    projects: [String]
});

const Team = mongoose.model("Team", teamSchema);
const User = mongoose.model("User", userSchema);

async function testLeave() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find a team and a member who is not a leader
    const team = await Team.findOne({ members: { $not: { $size: 0 } } });
    if (!team) {
        console.log("No teams found for testing.");
        process.exit(0);
    }
    
    // Create a dummy user in the team to test leaving
    const dummyEmail = "dummy_leave_test@example.com";
    if (!team.members.includes(dummyEmail)) {
        team.members.push(dummyEmail);
        await team.save();
    }
    
    let dummyUser = await User.findOne({ email: dummyEmail });
    if (!dummyUser) {
        dummyUser = new User({ email: dummyEmail, name: "Dummy", teamName: team.name });
        await dummyUser.save();
    } else {
        dummyUser.teamName = team.name;
        await dummyUser.save();
    }
    
    console.log("Attempting leave operation for", dummyEmail, "from team", team.name);
    
    try {
        const teamName = team.name;
        const email = dummyEmail;

        const dbTeam = await Team.findOne({ name: teamName });
        if (!dbTeam) throw new Error("Team not found");
        if (!dbTeam.members.includes(email)) throw new Error("You are not a member of this team");
        if (dbTeam.leader === email) throw new Error("Team leader cannot leave. You may need to delete the team.");

        dbTeam.members = dbTeam.members.filter(e => e !== email);
        await dbTeam.save();

        const user = await User.findOneAndUpdate(
            { email },
            { $set: { teamName: null } },
            { new: true }
        );
        
        console.log("SUCCESS! User:", user);
    } catch (err) {
        console.error("FAILED! Error details:", err);
    }
    
    process.exit(0);
}

testLeave();
