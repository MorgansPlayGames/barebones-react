const jwt = require('jsonwebtoken');
// const passport = require('passport');
const config = require('../config/database');
const db = require('../models');
const bcrypt = require('bcrypt');
const ObjectID = require('mongodb').ObjectID;

genToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            sub: user._id,
            iat: new Date().getTime(),
            exp: new Date().setDate(new Date().getDate() + 1),
        },
        config.jwt_secret
    );
};

module.exports = {
    login: async function (req, res) {
        try {
            const email = req.body.email;
            const password = req.body.password;
            const user = await db.User.findOne({ email: email });

            if (!user) {
                res.status(401).send({
                    success: false,
                    message: 'Login failed!',
                });
                return;
            }

            const passVal = await bcrypt.compare(password, user.password);

            if (!passVal) {
                res.status(401).send({
                    success: false,
                    message: 'Login failed!',
                });
                return;
            }
            let token = genToken(user.toJSON());
            res.json({
                success: true,
                token: token,
            });
        } catch (err) {
            res.status(500).json(err);
        }
    },
    logout: async function (req, res) {
        req.logout();
        res.redirect('/');
    },
    createUser: async function (req, res) {
        try {
            const newUser = req.body;
            newUser.password = await bcrypt.hash(req.body.password, 10);
            const addedUser = await db.User.create(newUser);
            newUser.passwordChanged = true;
            await db.UserAuditLog.create(newUser);

            let token = genToken(addedUser.toJSON());
            res.json({
                success: true,
                token: token,
            });
            
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    },
    updateUser: async function (req, res) {
        try {
            const userId = req.user._id;
            const password = req.body.password;
            const user = await db.User.findById(userId);

            const updatedUser = { ...user, ...req.body };

            if (password) {
                const passVal = await bcrypt.compare(password, user.password);

                if (!passVal) {
                    updatedUser.passwordChanged = true;
                    updatedUser.password = await bcrypt.hash(
                        req.body.password,
                        10
                    );
                } else {
                    updatedUser.passwordChanged = false;
                    updatedUser.password = user.password;
                }
            } else {
                updatedUser.passwordChanged = false;
                updatedUser.password = user.password;
            }

            await db.UserAuditLog.create(updatedUser);

            const updated = await db.User.updateOne(
                { _id: ObjectID(userId) },
                {
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    username: updatedUser.username,
                    password: updatedUser.password,
                    email: updatedUser.email,
                    tags: updatedUser.tags,
                }
            );
            if (updated.nModified === 1) {
                res.status(200).json({ message: 'user updated' });
            } else {
                res.status(404).json({ message: 'user not updated' });
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },
    getUser: async function (req, res) {
        try {
            const userId = req.user._id;
            const user = await db.User.findById(userId);
            user.password = 'you wish, scrub';

            if (!user) {
                res.status(401).send({
                    success: false,
                    message: 'No user found',
                });
                return;
            }
            res.status(200).json({
                success: true,
                userData: user,
            });
        } catch (err) {
            res.status(500).json(err);
        }
    },
};
