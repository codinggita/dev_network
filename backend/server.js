const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());


// MongoDB connection using .env
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB Connected"))
.catch(err => console.log(err));


// Schema
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
    projects: [String]
});

const Team = mongoose.model("Team", teamSchema);

const User = mongoose.model("User", userSchema);


// GET all users
app.get("/api/users", async (req,res)=>{
    const users = await User.find();
    res.json(users);
});


// GET user by name
app.get("/user/name/:nm", async (req,res)=>{
    const users = await User.find({name:req.params.nm});
    res.json(users);
});


// GET user by age
app.get("/user/:ag", async (req,res)=>{
    const users = await User.find({age:req.params.ag});
    res.json(users);
});


// GET user by city
app.get("/user/city/:city", async (req,res)=>{
    const users = await User.find({city:req.params.city});
    res.json(users);
});


// GET user by state
app.get("/user/state/:state", async (req,res)=>{
    const users = await User.find({state:req.params.state});
    res.json(users);
});


// POST add user
app.post("/user", async (req,res)=>{

    const {name, email, password, age, city, state, skills, profilePhoto} = req.body;

    const user = new User({
        name,
        profilePhoto,
        email,
        password,
        age,
        city,
        state,
        skills: skills.split(",")
    });

    await user.save();

    res.json({
        message:"User added",
        user
    });

});


// PUT update by name
app.put("/user/name/:nm", async (req,res)=>{
    await User.updateMany({name:req.params.nm}, req.body);
    res.json({message:"Updated by name"});
});


// PUT update by age
app.put("/user/:ag", async (req,res)=>{
    await User.updateMany({age:req.params.ag}, req.body);
    res.json({message:"Updated by age"});
});


// PUT update by city
app.put("/user/city/:city", async (req,res)=>{
    await User.updateMany({city:req.params.city}, req.body);
    res.json({message:"Updated by city"});
});


// PUT update by state
app.put("/user/state/:state", async (req,res)=>{
    await User.updateMany({state:req.params.state}, req.body);
    res.json({message:"Updated by state"});
});


// PATCH update by name
app.patch("/user/name/:nm", async (req,res)=>{
    await User.updateMany({name:req.params.nm}, {$set:req.body});
    res.json({message:"Patched by name"});
});


// PATCH update by age
app.patch("/user/:ag", async (req,res)=>{
    await User.updateMany({age:req.params.ag}, {$set:req.body});
    res.json({message:"Patched by age"});
});


// PATCH update by city
app.patch("/user/city/:city", async (req,res)=>{
    await User.updateMany({city:req.params.city}, {$set:req.body});
    res.json({message:"Patched by city"});
});


// PATCH update by state
app.patch("/user/state/:state", async (req,res)=>{
    await User.updateMany({state:req.params.state}, {$set:req.body});
    res.json({message:"Patched by state"});
});


// PATCH update user for edit profile
app.patch("/api/users/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const updatedData = req.body;
        
        // Remove password / email from being updated easily this way, or handle safely
        delete updatedData.email;
        delete updatedData.password;
        delete updatedData.username; // Prevent changing username to avoid collisions

        if (updatedData.skills && typeof updatedData.skills === 'string') {
            updatedData.skills = updatedData.skills.split(",").map(s => s.trim());
        }
        if (updatedData.projects && typeof updatedData.projects === 'string') {
            updatedData.projects = updatedData.projects.split(",").map(p => p.trim());
        }

        const user = await User.findOneAndUpdate({ email }, { $set: updatedData }, { new: true });
        
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({ message: "Profile updated successfully.", user });
    } catch (err) {
        console.error("Update profile error:", err);
        res.status(500).json({ message: "Server error. " + err.message });
    }
});


// GET all teams
app.get("/api/teams", async (req, res) => {
    try {
        const teams = await Team.find();
        // Populate members data manually since members is an array of emails
        const populatedTeams = await Promise.all(teams.map(async (team) => {
            const membersData = await User.find({ email: { $in: team.members } }, 'name username profilePhoto skills email role');
            const requestsData = await User.find({ email: { $in: team.joinRequests || [] } }, 'name username profilePhoto skills email role');
            return { ...team.toObject(), memberDetails: membersData, requestDetails: requestsData };
        }));
        res.json(populatedTeams);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching teams" });
    }
});

// POST create team
app.post("/api/teams", async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) return res.status(400).json({ message: "Team name and email are required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.teamName) return res.status(400).json({ message: "User is already in a team" });

        const existingTeam = await Team.findOne({ name });
        if (existingTeam) return res.status(400).json({ message: "Team name already exists" });

        const team = new Team({ name, leader: email, members: [email], joinRequests: [], projects: [] });
        await team.save();

        user.teamName = name;
        await user.save();

        res.json({ message: "Team created successfully", team, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating team" });
    }
});

// POST request to join team
app.post("/api/teams/:name/request-join", async (req, res) => {
    try {
        const { name } = req.params;
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.teamName) return res.status(400).json({ message: "User is already in a team" });

        const team = await Team.findOne({ name });
        if (!team) return res.status(404).json({ message: "Team not found" });
        if (team.members.length >= 4) return res.status(400).json({ message: "Team is already full (max 4 members)" });
        if (team.joinRequests.includes(email)) return res.status(400).json({ message: "Join request already sent" });

        team.joinRequests.push(email);
        await team.save();

        res.json({ message: "Join request sent successfully", team });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error requesting to join team" });
    }
});

// POST accept join request
app.post("/api/teams/:name/accept-join", async (req, res) => {
    try {
        const { name } = req.params;
        const { leaderEmail, requesterEmail } = req.body;

        const team = await Team.findOne({ name });
        if (!team) return res.status(404).json({ message: "Team not found" });
        
        if (team.leader !== leaderEmail) return res.status(403).json({ message: "Only the team leader can accept requests" });
        if (!team.joinRequests.includes(requesterEmail)) return res.status(400).json({ message: "No join request found for this user" });
        if (team.members.length >= 4) return res.status(400).json({ message: "Team is already full" });

        const user = await User.findOne({ email: requesterEmail });
        if (!user) return res.status(404).json({ message: "Requester not found" });
        if (user.teamName) return res.status(400).json({ message: "User is already in a team" });

        // Move from requests to members
        team.joinRequests = team.joinRequests.filter(e => e !== requesterEmail);
        team.members.push(requesterEmail);
        await team.save();

        user.teamName = name;
        await user.save();

        res.json({ message: "Join request accepted", team });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error accepting join request" });
    }
});

// POST reject join request
app.post("/api/teams/:name/reject-join", async (req, res) => {
    try {
        const { name } = req.params;
        const { leaderEmail, requesterEmail } = req.body;

        const team = await Team.findOne({ name });
        if (!team) return res.status(404).json({ message: "Team not found" });
        
        if (team.leader !== leaderEmail) return res.status(403).json({ message: "Only the team leader can reject requests" });
        if (!team.joinRequests.includes(requesterEmail)) return res.status(400).json({ message: "No join request found for this user" });

        // Remove from requests
        team.joinRequests = team.joinRequests.filter(e => e !== requesterEmail);
        await team.save();

        res.json({ message: "Join request rejected", team });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error rejecting join request" });
    }
});


// POST signup
app.post("/api/auth/signup", async (req, res) => {
    try {
        const { username, email, password, profilePhoto, collegeName, age, city, state, skills, github, twitter, leetcode, youtube, projects } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email and password are required." });
        }

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email already registered." });

        const user = new User({
            name: username,
            profilePhoto,
            username,
            email,
            password,
            age,
            collegeName,
            city,
            state,
            skills: skills ? skills.split(",").map(s => s.trim()) : [],
            github,
            twitter,
            leetcode,
            youtube,
            projects: projects ? projects.split(",").map(p => p.trim()) : []
        });

        await user.save();
        res.json({ message: "User registered successfully.", user });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Server error. Please try again." });
    }
});


// POST login
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "No account found with this email." });
        if (user.password !== password) return res.status(400).json({ message: "Invalid credentials." });

        res.json({ message: "Login successful.", user });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error. Please try again." });
    }
});


app.listen(process.env.PORT, ()=>{
    console.log(`Server running on port ${process.env.PORT}`);
});