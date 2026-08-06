import { Router } from 'express'
import { EmployeeController } from '../controllers/EmployeeController'

const router = Router()
const employeeController = new EmployeeController()

router.get('/', employeeController.list)
router.post('/', employeeController.create)
router.put('/:id', employeeController.update)

export default router
