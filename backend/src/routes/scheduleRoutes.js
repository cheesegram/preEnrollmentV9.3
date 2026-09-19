import express from 'express';
import {
	getAllSchedules,
	getScheduleById,
	getScheduleConflicts,
	updateScheduleClasses,
	patchScheduleClasses,
	createScheduleRequest,
	getScheduleRequests,
} from '../controllers/masterScheduleController.js';
import { generateSchedule } from '../controllers/scheduleController.js';

const router = express.Router();

router.get('/', getAllSchedules);
router.get('/conflicts', getScheduleConflicts);
router.post('/schedulerequests', createScheduleRequest);
router.get('/schedulerequests', getScheduleRequests);
router.get('/:id', getScheduleById);
router.patch('/:id/classes', updateScheduleClasses);
router.post('/generate', generateSchedule);

export default router;
