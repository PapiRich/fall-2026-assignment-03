import { Router } from 'express';
import{
    getAllTickets,
    getTicketById,
    createTicket,
    updateTicketStatus,

}from '../dal/tickets.js';
import{authMiddleware} from '../middleware/auth.js';
import {
  insertTimeLog,
  getTotalHoursForTicket,
} from '../dal/timeLogs.js';

const router = Router();

const validStatuses = [ 'TODO', 'IN_PROGRESS','DONE'];

router.get('/',async(req,res) => {
    const limit = req.query.limit !== undefined ? Number(req.query.limit): undefined;
    const offset = req.query.offset != undefined ? Number(req.query.offset): undefined;
    const status = req.query.status !== undefined ? String(req.query.status): undefined;
    if(
        (limit !== undefined && (!Number.isInteger(limit) || limit <= 0)) || (offset !== undefined && (!Number.isInteger(offset) || offset < 0))
    ){
        res.status(400).json({error: ' Invalid pagination parameters'});
        return;
    }
    if (status !== undefined && !validStatuses.includes(status)){
        res.status(400).json({error: 'Invalid status'});
        return;
    }
    const tickets = await getAllTickets({
        limit,
        offset,
        status,
    });
    res.json(tickets);
});
// POST /tickets/:id/time
router.post('/:id/time', authMiddleware, async (req, res) => {
    const ticketId = Number(req.params.id);
    const userId = res.locals.userId;
    const { hours } = req.body;

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
        res.status(400).json({ error: 'Invalid ticket ID' });
        return;
    }

    if (typeof hours !== 'number' || hours <= 0) {
        res.status(400).json({ error: 'Invalid hours' });
        return;
    }

    const timeLog = await insertTimeLog(ticketId, userId, hours);

    res.status(201).json(timeLog);
});

// GET /tickets/:id/time
router.get('/:id/time', async (req, res) => {
    const ticketId = Number(req.params.id);

    if (!Number.isInteger(ticketId) || ticketId <= 0) {
        res.status(400).json({ error: 'Invalid ticket ID' });
        return;
    }

    const totalHours = await getTotalHoursForTicket(ticketId);

    res.status(200).json({
        ticket_id: ticketId,
        total_hours: totalHours,
    });
});
router.get('/:id',async(req,res) => {
    const id = Number(req.params.id);

    if(!Number.isInteger(id)||id <= 0){
        res.status(400).json({error:'Invalid ticket ID'});
        return;
    }
    const ticket = await getTicketById(id);
    if(!ticket){
        res.status(404).json({error:'Ticket not found'});
        return;
    }
    res.json(ticket);
});
router.post('/',authMiddleware,async(req,res)=> {
    const {title,description} = req.body;
    const creatorId = res.locals.userId;

    if(typeof title !== 'string' || title.trim() === '' || typeof description !== 'string'){
        res.status(400).json({error: 'Invalid ticket payload'});
        return;
    }
    const ticket = await createTicket({
        title,
        description,
        creator_id: creatorId,

    });
    res.status(201).json(ticket);

});

router.patch('/:id/status', authMiddleware,async(req,res) => {
    const id = Number(req.params.id);
    const{status} = req.body;

    if(!Number.isInteger(id) || id <=0){
        res.status(400).json({error: ' Invalid ticket ID'});
        return;
    }
   
    if(typeof status !== 'string' || !validStatuses.includes(status)){
        res.status(400).json({error: 'Ticket not found'});
        return;
    }
     const ticket = await updateTicketStatus(id,status);
     if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }
    res.status(200).json(ticket);
});

// TODO: Student implementation - Part 1: Ticket Routes
// GET /tickets
// GET /tickets/:id
// POST /tickets
// PATCH /tickets/:id/status

// TODO: Student implementation - Part 2: Time Log Routes
// POST /tickets/:id/time
// GET /tickets/:id/time

export default router;
