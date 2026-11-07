const express = require("express");
const router = express.Router();
const mongoDB = require("../db/mongoDB");
const jwt = require("jsonwebtoken");

router.post("/log/browser", (req, res, next) => {
    const device = req.body;
    device.ip = req.ip;
    const Device = mongoDB.model("Device");
    const newDevice = new Device(device);
    newDevice.save();

    res.sendStatus(200);
});

function getEmail(req) {
    const id_token = req.headers.authorization
        ?.split('"id_token":"')[1]
        ?.split('"')[0];
    try {
        const email = jwt.decode(id_token)?.email;
        return typeof email === "string" ? email : null;
    } catch (error) {
        return null;
    }
}

// Express 4 does not catch async rejections, and an unhandled one ends the process.
function withUser(getUser) {
    return async (req, res, next) => {
        const email = getEmail(req);
        if (!email) return res.sendStatus(401);
        try {
            const user = await getUser(email);
            if (!user) return res.sendStatus(404);
            res.json(user);
        } catch (error) {
            console.error(error.message);
            res.sendStatus(500);
        }
    };
}

// db apis
router.get("/init", withUser(initUser));

async function initUser(email) {
    const User = mongoDB.model("User");
    let user = await User.findOne({
        email: email,
    });
    if (!user) {
        const newUser = new User({
            email: email,
        });
        await newUser.save();
        user = newUser;
    }
    return user;
}

router.put("/win", withUser((email) => updateUser(email, "win")));

router.put("/lose", withUser((email) => updateUser(email, "lose")));

async function updateUser(email, result) {
    const User = mongoDB.model("User");
    let user = await User.findOne({
        email: email,
    });
    if (!user) return null;
    if (result === "win") {
        user.win++;
    } else {
        user.loss++;
    }
    await user.save();
    return user;
}

module.exports = router;
