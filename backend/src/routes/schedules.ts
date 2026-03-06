import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Get all schedules for the logged-in user
router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const schedules = await prisma.schedule.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        res.json(schedules);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
});

// Create a new schedule
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { title, description, month, startDate, endDate, priority, status } = req.body;

        const schedule = await prisma.schedule.create({
            data: {
                title,
                description,
                month,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                priority,
                status: status || 'Todo',
                userId,
            },
        });

        res.status(201).json(schedule);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create schedule' });
    }
});

// Update an existing schedule entirely
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const id = req.params.id as string;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const { title, description, month, startDate, endDate, priority, status, isCompleted } = req.body;

        // Verify ownership
        const existing = await prisma.schedule.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            res.status(404).json({ error: 'Schedule not found' });
            return;
        }

        // Build update data — only include fields that were actually sent
        const updateData: Record<string, any> = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (month !== undefined) updateData.month = month;
        if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
        if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
        if (priority !== undefined) updateData.priority = priority;
        if (status !== undefined) updateData.status = status;
        if (isCompleted !== undefined) {
            updateData.isCompleted = isCompleted;
            updateData.completedAt = isCompleted && !existing.isCompleted ? new Date() : (isCompleted === false ? null : existing.completedAt);
        }

        const updated = await prisma.schedule.update({
            where: { id },
            data: updateData,
        });

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update schedule' });
    }
});

// Update schedule status (Partial update for Drag & Drop functionality)
router.patch('/:id/status', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const id = req.params.id as string;
        const { status } = req.body;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Verify ownership
        const existing = await prisma.schedule.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            res.status(404).json({ error: 'Schedule not found' });
            return;
        }

        const updated = await prisma.schedule.update({
            where: { id },
            data: { status },
        });

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update schedule status' });
    }
});

// Delete a schedule
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const id = req.params.id as string;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Verify ownership
        const existing = await prisma.schedule.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            res.status(404).json({ error: 'Schedule not found' });
            return;
        }

        await prisma.schedule.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete schedule' });
    }
});

export default router;
