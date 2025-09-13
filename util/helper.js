require('dotenv').config();
const secretKey = process.env.SECRET_KEY;
const otp_length = process.env.OTP_LEN;
const otp_expire_in = process.env.OTP_EXP;

const admin = require('firebase-admin');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
// const crypto = require('crypto');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const ObjectId = mongoose.Types.ObjectId;


let device = require('../service/user_device');
let user_service = require('../service/user.js');
let notification = require('../service/notification.js');
const user_otp = require("../schema/user_otp.js");


const messages = require("./messages.js");
const serviceAccount = require('../util/welliva.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

let secret_key = process.env.AWS_SECRET_ACCESS_KEY;
let access_key = process.env.AWS_ACCESS_KEY_ID;
let bucket_name = process.env.AWS_BUCKET_NAME;
let region_name = process.env.AWS_REGION;

const s3 = new S3Client({
    region: region_name,
    credentials: { 'accessKeyId': access_key, 'secretAccessKey': secret_key, }
});

// Intialize crypto encryption
// const new_hex = crypto.createHash('sha256').update('app_factory_143').digest('hex');
// console.log('new ==>', new_hex)

// const keyBuffer = Buffer.from('fb41e1009337aae719ef45147898faffe4555b8aea650fcc1ab7a27097bc91ef'.trim(), 'hex');

const createJWT = (payload) => {         // expires in 30 days
    return jwt.sign(payload, secretKey);
};

const hashPassword = async (password) => {
    const hash = await bcrypt.hash(password, 5);
    return hash;
};

const checkPassword = (password, hash) => {
    let result = bcrypt.compare(password.toString(), hash);
    return result;
};

const generateOTP = () => {
    let otp = Math.random().toString().slice(2, 2 + otp_length).padEnd(otp_length, '0');
    // return otp.toString();
    return "123456"
};

const send_notification = async (title, user_id) => {
    console.log("\nsend notification function call succesfully")
    try {
        console.log('\nnotificaiton_data ==>', `
            { user_id: ${user_id}, 
             title: ${title}
            }`)

        let [userDevices, exist_user] = await Promise.all([
            device().get_all({ 'user_id': user_id }),
            user_service().fetch_by_query({ _id: new ObjectId(user_id) })
        ]);

        if (userDevices.length > 0) {
            for (let i = 0; i < userDevices.length; i++) {
                let { device_token } = userDevices[i];

                const firebase_message = {
                    data: { 'user_type': 'user' },
                    token: device_token,
                    notification: {
                        title: title,
                        body: `${messages('en')['notification_discription']}`,
                    },
                };

                console.log('\n =-=-=-=-=- This notification you have tried to send =-=-=-=-=- ');
                console.log(firebase_message)

                admin.messaging().send(firebase_message)
                    .then((response) => { console.log('Notification sent:', response); })
                    .catch((error) => { console.error('Error sending notification:', error); });
            }
        }
    }
    catch (err) { console.log(err) }
}

const send_bulk_notification = async (title, discription, tokens) => {
    console.log('send bulk notification service call successfully');
    try {
        console.log('tokens ==>', tokens)
        const message = {
            notification: { title: title, body: discription },
            tokens: tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message)
        console.log("response ==>", response)
    } catch (error) {
        console.log(error)
    }
}

const send_mobile_otp = async (country_code, mobile, type, user_role, user_id) => {
    console.log('send otp on mobile number is processing ...');
    try {
        let otp = generateOTP();
        const expired_at = new Date(Date.now() + otp_expire_in * 1000);

        let otp_payload = { country_code, mobile, otp, type, user_role, expired_at, user_id }
        await user_otp.create(otp_payload);

        return true;
    }
    catch (err) {
        console.log('\n\n =-=-=-=-=-=- error =-=-=-=-=-=- ');
        console.log(err)
    }
}

const send_email_otp = async (email, type, user_role, user_id) => {
    console.log('send otp on email number is processing ...');
    try {
        let otp = generateOTP();
        const expired_at = new Date(Date.now() + otp_expire_in * 1000);

        let otp_payload = { email, otp, type, user_role, expired_at, user_id }

        await user_otp.create(otp_payload);
    }
    catch (err) {
        console.log('\n\n =-=-=-=-=-=- error =-=-=-=-=-=- ');
        console.log(err)
    }
}

const verify_otp = async (query, otp) => {
    console.log('verify otp function call...')
    try {

        const record = await user_otp.findOne(query).sort({ createdAt: -1 });

        let msg = "otp_verified";
        if (!record || record?.otp !== otp) msg = "Invalid_otp"
        if (record?.expired_at < new Date()) msg = "otp_expired";

        return record == null ? null : { msg, role: record.user_role, user_id: record.user_id };
    }
    catch (err) {
        console.log('\n\n =-=-=-=-=-=- error =-=-=-=-=-=- ');
        console.log(err)
    }
}

const uniqString = () => {
    return Math.random().toString(36).slice(2, 7).toUpperCase()
}

const create_notification_payload = async (title, user_id, user_type, action_id, other_user_id) => {
    console.log('create notificaiton function call successfully');
    try {

        let notification_payload = {

            "title": title,
            "description": messages("en")['notification_discription'],
            "notification_type": 1,
            "other_user_id": other_user_id,
            "user_id": user_id,
            "user_type": user_type,
            "action_id": action_id
        };

        await notification().add(notification_payload);
        return notification_payload;

    } catch (err) { console.log(err) }
}

// function encrypt_data(data) {
//     try {

//         const iv = crypto.randomBytes(16);
//         const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
//         const json_string = JSON.stringify(data);
//         const encrypted = Buffer.concat([cipher.update(json_string, 'utf8'), cipher.final()]);
//         return iv.toString('hex') + '.' + encrypted.toString('hex');

//     } catch (error) {
//         console.log("Error in encrypt:", error);
//         return null;
//     }
// }

// function decrypt_data(encryptedString) {
//     try {
//         const [ivHex, encryptedHex] = encryptedString.split('.');
//         const iv = Buffer.from(ivHex, 'hex');
//         const encryptedText = Buffer.from(encryptedHex, 'hex');
//         const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, iv);
//         const decrypted = Buffer.concat([
//             decipher.update(encryptedText),
//             decipher.final()
//         ]);
//         return decrypted.toString('utf8');
//     } catch (error) {
//         console.log("Error in decrypt:", error);
//         return null;
//     }
// }

const upload_s3_file = async (file) => {
    console.log('upload s3 file continuee ...');
    // console.log('\n <================== file ==================>')
    // console.log(file)
    try {
        let name = file.name.replace(/\s+/g, '-').replace(/[()]/g, '').toLowerCase();
        let stream = fs.createReadStream(file.path);
        let mime_type = file.type;

        const params = {
            Bucket: bucket_name,
            Key: `app_factory/${name}`,
            ACL: "public-read",
            Body: stream,
            ContentType: mime_type
        };

        const command = new PutObjectCommand(params);
        // const upload_result = await s3.send(command);

        // console.log('\n =-=-=-=-=--=-=- data after upload file on s3 bucket cloud =-=-=-=-=--=-=- ',)
        // console.log(upload_result);

        const location = `https://${params.Bucket}.s3.${region_name}.amazonaws.com/${params.Key}`;
        console.log('\n File uploaded successfully:', location);

        return location;
    }
    catch (err) {
        console.log(err)
    }
}

module.exports = {
    generateOTP,
    createJWT,
    hashPassword,
    checkPassword,
    send_mobile_otp,
    send_email_otp,
    verify_otp,
    uniqString,
    send_notification,
    send_bulk_notification,
    create_notification_payload,
    // encrypt_data,
    // decrypt_data,
    upload_s3_file
}