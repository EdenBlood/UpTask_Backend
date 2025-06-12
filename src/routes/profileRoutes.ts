import { Router } from "express";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validatio";
import { ProfileController } from "../controllers/ProfileController";
import { authenticate } from "../middlewares/auth";

const router = Router()

router.use(authenticate)

router.patch('/', [
    body('name')
      .notEmpty().withMessage('El nombre es obligatorio'),
    body('email')
      .isEmail().withMessage('Email no Valido'),
  ],
  handleInputErrors,
  ProfileController.updateProfile
)

router.patch('/change-password', [
    body('current_password')
      .isLength({min: 8}).withMessage('El password debe tener mínimo 8 caracteres'),
    body('new_password')
      .isLength({min: 8}).withMessage('El password debe tener mínimo 8 caracteres'),
    body('new_password_repeat')
      .custom((value, {req}) => {
        if (value !== req.body.new_password) {
          throw new Error('Los password no son iguales')
        }
        return true;
      })
  ],
  handleInputErrors,
  ProfileController.updatePassword
)

export default router;