import { Router } from "express";
import { body, param } from 'express-validator'
import { ProjectController } from "../controllers/ProjectControllet"; 
import { handleInputErrors } from "../middlewares/validatio";
import { TaskController } from "../controllers/TaskControllet";
import { projectExist } from "../middlewares/project";
import { hasAuthorization, taskBelongsToProject, taskExist } from "../middlewares/task";
import { authenticate } from "../middlewares/auth";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";


//* Creamos una instancia del router.
const router = Router()

//*Section CRUD */
router.use(authenticate) //* Hacemos que todos los endpoints de este router usen el middleware de "authenticate".

router.post('/', [
    body('projectName')
      .notEmpty().withMessage('El Nombre del Proyecto es Obligatorio.'),
    body('clientName')
      .notEmpty().withMessage('El Nombre del Proyecto es Obligatorio.'),
    body('description')
      .notEmpty().withMessage('El Nombre del Proyecto es Obligatorio.'),
  ],
  handleInputErrors,
  ProjectController.createProject
)

router.get('/', 
  ProjectController.getAllProjects
)

router.get("/:id", [
  param('id')
    .isMongoId().withMessage('Id no válido'),
  ],
  handleInputErrors,
  ProjectController.getProjectById
)

//* Para evitarnos poner el projectExist y que se ejecute automáticamente en todas las urls que reciban el parámetro "projectId" en la url colocamos lo siguiente:
router.param('projectId', projectExist)
//* Siempre que la url tenga este param va a ejecutar antes validateProjectExist.

router.put("/:projectId", [
    param('projectId')
      .isMongoId().withMessage('Id no válido'),
    body('projectName')
      .notEmpty().withMessage('El Nombre del Proyecto es Obligatorio.'),
    body('clientName')
      .notEmpty().withMessage('El Nombre del Proyecto es Obligatorio.'),
    body('description')
      .notEmpty().withMessage('El Nombre del Proyecto es Obligatorio.'),
  ],
  handleInputErrors,
  hasAuthorization,
  ProjectController.updateProject
)

router.delete("/:projectId", [
    param('projectId')
      .isMongoId().withMessage('Id no válido'),
  ],
  handleInputErrors,
  hasAuthorization,
  ProjectController.deleteProject
)

//*Section Rutas para las Task (Tareas) */
router.param('taskId', taskExist)
router.param('taskId', taskBelongsToProject)

router.post('/:projectId/tasks', hasAuthorization, [
    param('projectId')
      .isMongoId().withMessage('Id no válido'),
    body('name')
      .notEmpty().withMessage('El Nombre del Proyecto es Obligatorio.'),
    body('description')
      .notEmpty().withMessage('El Nombre del Proyecto es Obligatorio.'),
  ],
  handleInputErrors,
  TaskController.createTask
)

router.get('/:projectId/tasks', [
    param('projectId')
      .isMongoId().withMessage('Id no válido'),
  ],
  handleInputErrors,
  TaskController.getProjectTask
)

router.get('/:projectId/tasks/:taskId', [
    param('projectId')
      .isMongoId().withMessage('Id no válido'),
    param('taskId')
      .isMongoId().withMessage('Id no válido'),
  ],
  handleInputErrors,
  TaskController.getProjectTaskById
)

router.put('/:projectId/tasks/:taskId', hasAuthorization, [
    param('projectId')
      .isMongoId().withMessage('Id no válido'),
    param('taskId')
      .isMongoId().withMessage('Id no válido'),
    body('name')
      .notEmpty().withMessage('El Nombre del Proyecto es Obligatorio.'),
    body('description')
      .notEmpty().withMessage('El Nombre del Proyecto es Obligatorio.'),
  ],
  handleInputErrors,
  TaskController.updatedTask
)

router.delete('/:projectId/tasks/:taskId', hasAuthorization, [
    param('projectId')
      .isMongoId().withMessage('Id no válido'),
    param('taskId')
      .isMongoId().withMessage('Id no válido'),
  ],
  handleInputErrors,
  TaskController.deleteTask
)

router.post('/:projectId/tasks/:taskId/status', [
    param('projectId')
      .isMongoId().withMessage('Id no válido'),
    param('taskId')
      .isMongoId().withMessage('Id no válido'),
    body('status')
      .notEmpty().withMessage('El estado es obligatorio')
  ],
  handleInputErrors,
  TaskController.updatedTaskStatus
)


//*Section Router for teams */
router.post('/:projectId/team/find', [
    body('email')
      .isEmail().toLowerCase().withMessage('Email no Valido')
  ],
  handleInputErrors,
  TeamMemberController.findMemberByEmail
)

router.post('/:projectId/team', [
    body('id')
    .isMongoId().withMessage('ID No Valido')
  ],
  handleInputErrors,
  TeamMemberController.addMemberById
)

router.get('/:projectId/team', TeamMemberController.getProjectTeam)

router.delete('/:projectId/team/:userId', [
    param('userId')
    .isMongoId().withMessage('ID No Valido')
  ],
  handleInputErrors,
  TeamMemberController.removeMemberById
)


//*Section Rutas para las Notas */
router.post('/:projectId/tasks/:taskId/notes', [
    body('content')
      .notEmpty().withMessage('El contenido de la nota es obligatorio')
  ],
  handleInputErrors,
  NoteController.createNote
)

router.get('/:projectId/tasks/:taskId/notes', NoteController.getNotes)

router.delete('/:projectId/tasks/:taskId/notes/:noteId', [
    param('noteId')
      .isMongoId().withMessage('La Nota no existe')
  ],
  handleInputErrors,
  NoteController.deleteNote
)

export default router;