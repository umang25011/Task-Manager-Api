const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendWelcomeEmail = (email, name) => {
    transporter
        .sendMail({
            from: "Task Manager App",
            to: email,
            subject: "Thanks For Joining Task Manager App ",
            text : `Thanks ${name} for joining.`,
        })
        .then(() => {})
        .catch((err) => console.log(err));
};
const cancleEmail = (email,name) => {
    transporter
        .sendMail({
            from: "umang25011.Education@gmail.com",
            to: email,
            subject: "Task Manager App",
            text : `Sorry ${name} to see you go.`,
        })
        .then(() => {})
        .catch((err) => console.log(err));
}

module.exports = {
    sendWelcomeEmail,
    cancleEmail,
};
