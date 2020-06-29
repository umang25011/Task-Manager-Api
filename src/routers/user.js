const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require('sharp')
const {sendWelcomeEmail , cancleEmail} = require('../emails/account')

router.post("/users", async (req, res) => {
    const user = new User(req.body);
    try {
        const token = await user.generateAuthToken();
        await user.save();
        sendWelcomeEmail(user.email,user.name)
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});
router.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send(e.message);
    }
});
router.post("/users/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(
            (token) => token.token !== req.token
        );
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});
router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send("Logged out from All Devices");
    } catch (e) {
        res.status(500).send();
    }
});
router.get("/users/me", auth, async (req, res) => {
    res.send(req.user);
});

router.patch("/users/me", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password", "age"];
    const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
    );
    if (!isValidOperation)
        return res.status(400).send({ errors: "Invalide Operation" });

    try {
        updates.forEach((update) => (req.user[update] = req.body[update]));
        await req.user.save();

        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
});
router.delete("/users/me", auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id);
        // if (!user) return res.status(400).send();
        await req.user.remove();
        cancleEmail(req.user.email,req.user.name)
        res.send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|png|jpeg)$/))
            return cb(new Error("Upload jpg,jpeg,png file only."));
        cb(undefined, true);
    },
});

router.post(
    "/users/me/avatar",
    auth,
    upload.single("avatar"),
    async (req, res) => {
        const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
        req.user.avatar = buffer


        await req.user.save()
        res.send();
    },
    (err, req, res, next) => {
        res.status(400).send({ error: err.message });
    }
);
router.delete('/users/me/avatar', auth,async (req,res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})
router.get('/users/:id/avatar', async (req,res) => {
    try {
        const user = await User.findById({_id : req.params.id})
        if ( !user || !user.avatar)
            throw new Error()
        res.set('Content-type','image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})
module.exports = router;
