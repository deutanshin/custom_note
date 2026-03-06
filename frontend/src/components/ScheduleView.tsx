import { useState, useEffect, useMemo } from 'react';
import ListView from './ListView';
import BoardView from './BoardView';
import DetailSidebar from './DetailSidebar';
import type { Schedule, ViewMode } from '../types';
import './ScheduleView.css';
import { LayoutList, Columns, Target, Search, Filter, MoreHorizontal, ArrowUpDown } from 'lucide-react';

type SortMode = 'none' | 'startDate' | 'endDate';

interface ScheduleViewProps {
    token: string;
}

export default function ScheduleView({ token }: ScheduleViewProps) {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [loading, setLoading] = useState(true);
    const [sortMode, setSortMode] = useState<SortMode>('none');
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

    const sortedSchedules = useMemo(() => {
        return [...schedules].sort((a, b) => {
            // 1) Completed items always go to the bottom
            if (a.isCompleted !== b.isCompleted) {
                return a.isCompleted ? 1 : -1;
            }

            // 2) Within the same completion group, apply date sort
            if (sortMode !== 'none') {
                const field = sortMode; // 'startDate' or 'endDate'
                const dateA = a[field] ? new Date(a[field]!).getTime() : Infinity;
                const dateB = b[field] ? new Date(b[field]!).getTime() : Infinity;
                return dateA - dateB;
            }

            return 0;
        });
    }, [schedules, sortMode]);

    const fetchSchedules = async () => {
        try {
            const res = await fetch('/api/schedules', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSchedules(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [token]);

    const handleUpdate = async (id: string, updates: Partial<Schedule>) => {
        setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));

        try {
            await fetch(`/api/schedules/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });
        } catch (err) {
            console.error('Failed to update', err);
            fetchSchedules();
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        setSchedules(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));

        try {
            await fetch(`/api/schedules/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (err) {
            console.error('Failed to update status', err);
            fetchSchedules();
        }
    };

    const handleCreate = async (initialStatus: string = 'Todo') => {
        try {
            const res = await fetch('/api/schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: '',
                    status: initialStatus
                })
            });

            if (res.ok) {
                const newSchedule = await res.json();
                setSchedules([newSchedule, ...schedules]);
            }
        } catch (err) {
            console.error('Failed to create', err);
        }
    };

    const handleDelete = async (id: string) => {
        const backup = [...schedules];
        setSchedules(prev => prev.filter(s => s.id !== id));

        try {
            const res = await fetch(`/api/schedules/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error('Delete failed');
        } catch (err) {
            console.error('Failed to delete', err);
            setSchedules(backup);
        }
    };

    if (loading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading goals...</div>;

    return (
        <div className="schedule-container">
            <div className="schedule-header">
                <div className="schedule-header-top">
                    <Target className="title-icon" size={32} />
                    Monthly Goals
                </div>

                <div className="schedule-controls">
                    <div className="view-tabs">
                        <button
                            className={`view-tab ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <LayoutList size={16} /> 목록 뷰
                        </button>
                        <button
                            className={`view-tab ${viewMode === 'board' ? 'active' : ''}`}
                            onClick={() => setViewMode('board')}
                        >
                            <Columns size={16} /> 보드 뷰
                        </button>
                    </div>

                    <div className="toolbar-actions">
                        {/* Sort Selector */}
                        <div className="sort-selector">
                            <ArrowUpDown size={14} />
                            <select
                                className="sort-select"
                                value={sortMode}
                                onChange={(e) => setSortMode(e.target.value as SortMode)}
                            >
                                <option value="none">정렬 없음</option>
                                <option value="startDate">시작일 정렬</option>
                                <option value="endDate">마감일 정렬</option>
                            </select>
                        </div>

                        <button className="icon-btn" title="Filter"><Filter size={16} /></button>
                        <button className="icon-btn" title="Search"><Search size={16} /></button>
                        <button className="icon-btn" title="More"><MoreHorizontal size={16} /></button>
                        <button className="new-btn" onClick={() => handleCreate('Todo')}>
                            New <span style={{ fontSize: '10px' }}>▼</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="schedule-content">
                {viewMode === 'list' ? (
                    <ListView schedules={sortedSchedules} onUpdate={handleUpdate} onCreate={() => handleCreate('Todo')} onDelete={handleDelete} onOpenDetail={(s) => setSelectedSchedule(s)} />
                ) : (
                    <BoardView schedules={sortedSchedules} onUpdateStatus={handleUpdateStatus} onCreateStatus={handleCreate} onDelete={handleDelete} />
                )}
            </div>

            {selectedSchedule && (
                <DetailSidebar
                    schedule={selectedSchedule}
                    onUpdate={(id, updates) => {
                        handleUpdate(id, updates);
                        // Keep sidebar in sync with latest data
                        setSelectedSchedule(prev => prev ? { ...prev, ...updates } : null);
                    }}
                    onClose={() => setSelectedSchedule(null)}
                />
            )}
        </div>
    );
}
