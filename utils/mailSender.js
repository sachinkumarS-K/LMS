import nodemailer from 'nodemailer'
export default async function mailSender(email , title , body) {
     try {
          const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 465,
            secure: true,
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASSWORD
               },
          });

          const info = await transporter.sendMail({
               from: 'SACHIN KUAMR !! WEB DEVELOPER 😎😎😎',
               to: `${email}`,
               subject: `${title}`,
               html: `${body}`
          });
      
     } catch (error) {
          console.log(error.message)
     }
}