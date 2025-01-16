import nodemailer from 'nodemailer';

const emailText = 'confirm your email address';
const passwordText = 'reset your account password';

export const createHTMLTamplate = ({ code, name, isPassword }) => {
  return `<div>
          <h3>Hi ${name},</h3> 
          <p>There's one quick step you need to complete in order to ${
            isPassword ? passwordText : emailText
          }.</p>
          </br>
          <p>Please enter this OTP code on wallet.saukie.net when prompted</p>
          <h2>${code}</h2>
          <p>OTP expire after 2 hours</p>
          <p>
              Thanks, <br>
              Saukie Wallet
          </p>
      </div>  
  `;
};

const user = process.env.NODE_MAILER;
const pass = process.env.EMAIL_PASS;
export const sender = `Saukie Wallet <hello@saukie.net>`;

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user, pass },
});

export const sendMailAsync = async (mailOptions) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log('error is ' + error);
        resolve(false); // or use rejcet(false) but then you will have to handle errors
      } else {
        console.log('Email sent: ' + info.response);
        resolve(true);
      }
    });
  });
};
