import React from 'react';
import type { Schedule } from '../types';
import './BoardView.css';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { Circle, PlayCircle, CheckCircle2, Plus, Trash2 } from 'lucide-react';

interface BoardViewProps {
    schedules: Schedule[];
    onUpdateStatus: (id: string, status: string) => void;
    onCreateStatus: (status: string) => void;
    onDelete: (id: string) => void;
}

const COLUMNS = [
    { id: 'Todo', title: 'To-do', icon: <Circle size={16} /> },
    { id: 'InProgress', title: 'In progress', icon: <PlayCircle size={16} /> },
    { id: 'Done', title: 'Complete', icon: <CheckCircle2 size={16} /> }
];

function DraggableCard({ schedule, onDelete }: { schedule: Schedule, onDelete: (id: string) => void }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: schedule.id,
        data: { schedule }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="board-card">
            <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{schedule.title || 'Untitled'}</span>
                <button
                    className="icon-btn"
                    onClick={() => onDelete(schedule.id)}
                    style={{ cursor: 'pointer', color: '#FF5252', padding: 0 }}
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <div className="card-badges">
                {schedule.priority && (
                    <span className={`badge ${schedule.priority === 'High' ? 'badge-red' : schedule.priority === 'Medium' ? 'badge-yellow' : 'badge-blue'}`}>
                        ● {schedule.priority === 'High' ? '높음' : schedule.priority === 'Medium' ? '중간' : '낮음'}
                    </span>
                )}
                {schedule.month && (
                    <span className="badge badge-blue-bg">{schedule.month}</span>
                )}
            </div>

            {schedule.endDate && (
                <div className="card-meta">
                    {schedule.endDate.substring(0, 10)}
                </div>
            )}
        </div>
    );
}

function DroppableColumn({
    id,
    title,
    icon,
    schedules,
    onCreate,
    onDelete
}: {
    id: string;
    title: string;
    icon: React.ReactNode;
    schedules: Schedule[];
    onCreate: () => void;
    onDelete: (id: string) => void;
}) {
    const { isOver, setNodeRef } = useDroppable({ id });

    return (
        <div className="board-column">
            <div className={`column-header header-${id.toLowerCase()}`}>
                <div className="header-icon">
                    {icon} {title}
                </div>
                <div style={{ color: 'var(--text-tertiary)' }}>{schedules.length}</div>
            </div>

            <div ref={setNodeRef} className={`column-content ${isOver ? 'is-over' : ''}`}>
                {schedules.map(sch => (
                    <DraggableCard key={sch.id} schedule={sch} onDelete={onDelete} />
                ))}

                <div className="new-card-btn" onClick={onCreate}>
                    <Plus size={16} /> New {title.toLowerCase()}
                </div>
            </div>
        </div>
    );
}

export default function BoardView({ schedules, onUpdateStatus, onCreateStatus, onDelete }: BoardViewProps) {
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            // active.id is the schedule id
            // over.id is the column id ('Todo', 'InProgress', 'Done')

            const newStatus = over.id as string;
            const draggedSchedule = active.data.current?.schedule as Schedule | undefined;

            // Only fire update if status actually changed
            if (draggedSchedule && draggedSchedule.status !== newStatus) {
                onUpdateStatus(active.id.toString(), newStatus);
            }
        }
    };

    return (
        <div className="board-container">
            <DndContext onDragEnd={handleDragEnd}>
                {COLUMNS.map(col => (
                    <DroppableColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        icon={col.icon}
                        schedules={schedules.filter(s => s.status === col.id)}
                        onCreate={() => onCreateStatus(col.id)}
                        onDelete={onDelete}
                    />
                ))}
            </DndContext>
        </div>
    );
}
