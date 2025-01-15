import nodemailer from 'nodemailer';

const emailText = 'confirm your email address';
const passwordText = 'reset your account password';

export const createHTMLTamplate = ({
  code,
  isHobby,
  name,
  first_name,
  isPassword,
}) => {
  return `<div>
          <h3>Hi ${name ?? first_name},</h3> 
          <p>There's one quick step you need to complete in order to ${
            isPassword ? passwordText : emailText
          }.</p>
          </br>
          <p>Please enter this OTP code on ${
            isHobby ? 'Hobbychat.ng' : 'Saukie.net'
          } when prompted</p>
          <h2>${code}</h2>
          <p>OTP expire after 2 hours</p>
          <p>
              Thanks, <br>
              ${isHobby ? 'Hobbychat Team' : 'Saukie Pay'}
          </p>
      </div>  
  `;
};

const user = process.env.NODE_MAILER;
const pass = process.env.EMAIL_PASS;
export const sender = `Saukie Pay <hello@saukie.net>`;
export const hobbySender = `Hobbychat <hello@hobbychat.ng>`;

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
