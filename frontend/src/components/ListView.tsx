import './ListView.css';
import type { Schedule } from '../types';
import { Plus, GripVertical, Calendar, FileText, CheckCircle2, Trash2, ExternalLink } from 'lucide-react';

interface ListViewProps {
    schedules: Schedule[];
    onUpdate: (id: string, updates: Partial<Schedule>) => void;
    onCreate: () => void;
    onDelete: (id: string) => void;
    onOpenDetail: (schedule: Schedule) => void;
}

export default function ListView({ schedules, onUpdate, onCreate, onDelete, onOpenDetail }: ListViewProps) {

    const StatusBadge = ({ status }: { status: string }) => {
        if (status === 'Done' || status === '완료') return <span className="badge badge-green-bg">● 완료</span>;
        if (status === 'InProgress' || status === '진행 중') return <span className="badge badge-yellow">● 진행 중</span>;
        return <span className="badge badge-gray">● 시작 전</span>;
    };

    const PriorityBadge = ({ priority }: { priority?: string | null }) => {
        if (!priority) return null;
        if (priority === 'High' || priority === '높음') return <span className="badge badge-red">● 높음</span>;
        if (priority === 'Medium' || priority === '중간') return <span className="badge badge-yellow">● 중간</span>;
        if (priority === 'Low' || priority === '낮음') return <span className="badge badge-blue">● 낮음</span>;
        return null;
    };

    return (
        <div className="list-view-container">
            <div className="table-header">
                <div className="col-header">
                    <span style={{ width: '20px' }}>Aa</span> 목표
                </div>
                <div className="col-header"><Calendar size={14} /> 시작일</div>
                <div className="col-header"><Calendar size={14} /> 마감일</div>
                <div className="col-header">↑ 우선순위</div>
                <div className="col-header">📋 진행 상태</div>
                <div className="col-header"><CheckCircle2 size={14} /> 완료</div>
                <div className="col-header"><FileText size={14} /> 세부사항</div>
                <div className="col-header">삭제</div>
            </div>

            {schedules.map(schedule => (
                <div key={schedule.id} className={`table-row ${schedule.isCompleted ? 'row-completed' : ''}`}>
                    <div className="col-cell" style={{ gap: '12px' }}>
                        <GripVertical size={16} color="var(--text-tertiary)" style={{ cursor: 'grab' }} />
                        <FileText size={16} />
                        <input
                            className="title-input"
                            value={schedule.title}
                            onChange={(e) => onUpdate(schedule.id, { title: e.target.value })}
                        />
                    </div>

                    <div className="col-cell col-cell-muted">
                        <input type="date" className="ghost-select"
                            value={schedule.startDate ? schedule.startDate.substring(0, 10) : ''}
                            onChange={e => onUpdate(schedule.id, { startDate: e.target.value || undefined })} />
                    </div>

                    <div className="col-cell col-cell-muted">
                        <input type="date" className="ghost-select"
                            value={schedule.endDate ? schedule.endDate.substring(0, 10) : ''}
                            onChange={e => onUpdate(schedule.id, { endDate: e.target.value || undefined })} />
                    </div>

                    <div className="col-cell">
                        <select className="ghost-select"
                            value={schedule.priority || ''}
                            onChange={(e) => onUpdate(schedule.id, { priority: e.target.value })}>
                            <option value="">-</option>
                            <option value="High">높음</option>
                            <option value="Medium">중간</option>
                            <option value="Low">낮음</option>
                        </select>
                        <PriorityBadge priority={schedule.priority} />
                    </div>

                    <div className="col-cell">
                        <select className="ghost-select"
                            value={schedule.status}
                            onChange={(e) => onUpdate(schedule.id, { status: e.target.value })}>
                            <option value="Todo">시작 전</option>
                            <option value="InProgress">진행 중</option>
                            <option value="Done">완료</option>
                        </select>
                        <StatusBadge status={schedule.status} />
                    </div>

                    <div className="col-cell" style={{ justifyContent: 'center' }}>
                        <input
                            type="checkbox"
                            checked={schedule.isCompleted}
                            onChange={(e) => onUpdate(schedule.id, {
                                isCompleted: e.target.checked,
                                status: e.target.checked ? 'Done' : schedule.status
                            })}
                        />
                    </div>

                    <div className="col-cell" style={{ justifyContent: 'center' }}>
                        <button
                            className="detail-open-btn"
                            onClick={() => onOpenDetail(schedule)}
                            title="세부사항 보기"
                        >
                            <ExternalLink size={14} />
                            <span>{schedule.description ? '보기' : '작성'}</span>
                        </button>
                    </div>

                    <div className="col-cell col-cell-muted" style={{ justifyContent: 'center' }}>
                        <button className="icon-btn" onClick={() => onDelete(schedule.id)} title="삭제" style={{ cursor: 'pointer', color: '#FF5252' }}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}

            <div className="new-item-row" onClick={onCreate}>
                <Plus size={16} /> New item
            </div>
        </div>
    );
}
