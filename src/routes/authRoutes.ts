import { Router } from 'express'
import { AuthController } from '../controllers/AuthController';
import { body, param } from 'express-validator'
import { handleInputErrors } from '../middlewares/validatio';
import { authenticate, checkConfirmedAccount, getUserByEmail } from '../middlewares/auth';

const router = Router()

router.post('/create-account', [
    body('name')
      .notEmpty().withMessage('El Nombre no puede ir vacío'),
    body('email')
      .isEmail().withMessage('Email no valido'),
    body('password')
      .isLength({min: 8}).withMessage('El password debe contener mínimo 8 caracteres'),
    body('password_confirmation')
      .custom((value, {req}) => {
        if (req.body.password !== value) {
          throw new Error('Los Password no son iguales')
        }
        return true
      })
  ],
  handleInputErrors,
  AuthController.createAccount
)

router.post('/confirm-account', [
    body('token')
      .notEmpty().withMessage('El Token no puede ir vacío'),
  ],
  handleInputErrors,
  AuthController.confirmAccount
)

router.post('/login', [
    body('email')
      .isEmail().withMessage('Email no valido'),
    body('password')
      .isLength({min: 8}).withMessage('El password debe contener mínimo 8 caracteres'),
  ],
  handleInputErrors,
  getUserByEmail,
  checkConfirmedAccount,
  AuthController.login
)

router.post('/request-code', [
  body('email')
    .isEmail().withMessage('Email no valido')
  ],
  handleInputErrors,
  getUserByEmail,
  AuthController.requestConfirmationCode  
)

router.post('/forgot-password', [
  body('email')
  .isEmail().withMessage('Email no valido')
],
  handleInputErrors,
  getUserByEmail,
  checkConfirmedAccount,
  AuthController.requestForgotPasswordCode
)

router.post('/confirm-change-password', [
    body('token')
      .notEmpty().withMessage('El Token no puede ir vacío'),
  ],
  handleInputErrors,
  AuthController.confirmChangePasswordCode
)

router.post('/change-password/:token', [
    param('token')
      .isNumeric().withMessage('Token no valido'),
    body('password')
      .isLength({min: 8}).withMessage('El password debe contener mínimo 8 caracteres'),
    body('password_confirmation')
      .custom((value, {req}) => {
        if (req.body.password !== value) {
          throw new Error('Los Password no son iguales')
        }
        return true
      })
  ],
  handleInputErrors,
  AuthController.createNewPassword
)

router.get('/user', 
  authenticate,
  AuthController.user
)

//* Cuando intento eliminar un proyecto preguntar password
router.post('/check-password', authenticate, [
    body('password')
      .notEmpty().withMessage('El password no puede ir vació')
  ],
  handleInputErrors,
  AuthController.checkPassword
)

export default router;