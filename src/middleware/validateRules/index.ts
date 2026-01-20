import { Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'

export const validateRulesOfLogin = [
  body('username')
    .trim()
    .not()
    .isEmpty()
    .withMessage('El usuario es requerido')
    .escape(),
  body('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('La contraseña es requerida')
    .escape()
]

export const validateRulesOf2FA = [
  body('passCode')
    .trim()
    .not()
    .isEmpty()
    .withMessage('El código es requerido')
    .escape(),
  body('redirectTo')
    .trim()
    .not()
    .isEmpty()
    .withMessage('La url es requerida')
    .optional()
    .escape()
]

export const validateRulesOfModalSheet = [
  body('spreadsheetId')
    .trim()
    .not()
    .isEmpty()
    .withMessage('El id del libro es requerido')
    .escape(),
  body('sheetName')
    .trim()
    .not()
    .isEmail()
    .withMessage('El nombre de la hoja es requerido')
    .escape()
]

export const validateRulesOfCreatedUser = [
  body('firstName')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Los nombres son requeridos')
    .escape(),
  body('lastName')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Los apellidos son requeridos')
    .escape(),
  body('email')
    .trim()
    .not()
    .isEmpty()
    .isEmail()
    .withMessage('El correo electronico es requerido')
    .escape(),
  body('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('La contraseña es requerida')
    .escape()
]

export const validateRulesOfChangesPassword = [
  body('currentPassword')
    .trim()
    .not()
    .isEmpty()
    .withMessage('La contraseña actual es requerida')
    .escape(),
  body('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('La nueva contraseña es requerida')
    .escape(),
  body('repeatPassword')
    .trim()
    .not()
    .isEmpty()
    .withMessage('La confirmación de la nueva contraseña es requerida')
    .custom((value, { req }) => {
      return value === req.body.password
    })
    .escape()
]

export const validateRulesOfHierarchy = [
  body('name')
    .trim()
    .not()
    .isEmpty()
    .withMessage('El nombre es requerido')
    .escape(),
  body('description')
    .trim()
    .not()
    .isEmpty()
    .withMessage('La descripción es requerida')
    .escape(),
  body('hierarchyId')
    .trim()
    .not()
    .isEmpty()
    .withMessage('El id de la jerarquía es requerido')
    .escape()
]

export const validateRulesOfHierarchyUpdate = [
  body('name')
    .trim()
    .not()
    .isEmpty()
    .withMessage('El nombre es requerido')
    .escape(),
  body('description')
    .trim()
    .not()
    .isEmpty()
    .withMessage('La descripción es requerida')
    .escape(),
  body('level')
    .trim()
    .not()
    .isEmpty()
    .withMessage('El nivel de la jerarquía es requerido')
    .escape(),
  body('id').trim().not().isEmpty().withMessage('El id es requerido').escape()
]

export const validateData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() })

    return
  }

  next()
}
