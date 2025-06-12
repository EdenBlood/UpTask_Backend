import { tranporter } from "../config/nodemailer"

interface IEmail {
  email: string,
  name: string,
  token: string
}

export class AuthEmail {
  static sendConfirmationEmail = async ({ email, name, token } : IEmail ) => {
    const info = await tranporter.sendMail({
      from: 'UpTask <admin@uptask.com>',
      to: email,
      subject: 'UpTask - Confirma tu cuenta',
      text: 'UpTask - Confirma tu cuenta',
      html: `<p>Hola: ${name}, has creado tu cuenta en UpTask, ya casi esta todo listo, solo debes confirmar tu cuenta</p>
            <p>Visita el siguiente enlace: </p>
            <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
            <p>E ingresa el codigo: <b>${token}</b></p>
            <p>Este token expira en: <b>30 Minutos</b></p>
      `
    });
  }

  static sendPasswordResetToken = async ({ email, name, token } : IEmail ) => {
    const info = await tranporter.sendMail({
      from: 'UpTask <admin@uptask.com>',
      to: email,
      subject: 'UpTask - Restablece tu password',
      text: 'UpTask - Restablece tu password',
      html: `<p>Hola: ${name}, has solicitado restablecer el password</p>
            <p>Visita el siguiente enlace: </p>
            <a href="${process.env.FRONTEND_URL}/auth/new-password">Restablecer Password</a>
            <p>E ingresa el codigo: <b>${token}</b></p>
            <p>Este token expira en: <b>30 Minutos</b></p>
      `
    });
  }
}