import dotenv from 'dotenv'
import nodemailer from "nodemailer"

dotenv.config({
    path: './.env'
})

const getAccessToken = async () => {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: process.env.CLIENT_ID ?? '',
            client_secret: process.env.CLIENT_SECRET ?? '',
            refresh_token: process.env.REFRESH_TOKEN ?? '',
            grant_type: 'refresh_token',
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error_description || data.error || 'Unable to refresh Gmail access token');
    }

    return data.access_token;
};

const createTransporter = async () => {
    const accessToken = await getAccessToken();

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.EMAIL_USER,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken,
        },
    });
};

let transporterPromise;

const getTransporter = async () => {
    if (!transporterPromise) {
        transporterPromise = createTransporter();
    }

    return transporterPromise;
};

const verifyTransporter = async () => {
    try {
        const transporter = await getTransporter();
        await transporter.verify();
        console.log('Email server is ready to send messages');
    } catch (error) {
        transporterPromise = undefined;
        console.error('Error connecting to email server:', error);
    }
};

verifyTransporter();

const sendEmail = async (to, subject, text, html) => {
    try {
        const transporter = await getTransporter();
        const info = await transporter.sendMail({
        from: `Bank-Ledger <${process.env.EMAIL_USER}>`, // sender address
        to, // list of receivers
        subject, // Subject line
        text, // plain text body
        html, // html body
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        transporterPromise = undefined;
        console.error('Error sending email:', error);
        throw error;
    }
};

const sendingRegistrationEmail = async (email, name) => {
    const subject = 'Welcome to Bank-Ledger!'
    const text = `Hello ${name}\n \n Welcome to Bank-Ledger! Thank you for registering with us. We are excited to have you on board. If you have any questions or need assistance, feel free to reach out to our support team.`
    const html = `<p>Welcome to Bank-Ledger!</p><p>Thank you for registering with us. We are excited to have you on board. If you have any questions or need assistance, feel free to reach out to our support team.</p>`
    await sendEmail(email, subject, text, html);
}

const sendingTransactionSuccessfulEmail = async (email, fromAccount, toAccount, amount) => {
    const subject = 'Transaction Successful!'
    const text = `Hello,\n \n Your transaction from account ${fromAccount} to account ${toAccount} for the amount of ${amount} has been successfully completed. Thank you for using Bank-Ledger!`
    const html = `<p>Your transaction from account ${fromAccount} to account ${toAccount} for the amount of ${amount} has been successfully completed. Thank you for using Bank-Ledger!</p>`
    await sendEmail(email, subject, text, html);
}

export {
    sendingRegistrationEmail,
    sendingTransactionSuccessfulEmail
}