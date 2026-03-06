import { useState, useEffect, useRef } from 'react';
import type { Schedule } from '../types';
import { X, FileText } from 'lucide-react';
import './DetailSidebar.css';

interface DetailSidebarProps {
    schedule: Schedule;
    onUpdate: (id: string, updates: Partial<Schedule>) => void;
    onClose: () => void;
}

export default function DetailSidebar({ schedule, onUpdate, onClose }: DetailSidebarProps) {
    const [description, setDescription] = useState(schedule.description || '');
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync when schedule changes externally
    useEffect(() => {
        setDescription(schedule.description || '');
    }, [schedule.id, schedule.description]);

    const handleChange = (value: string) => {
        setDescription(value);

        // Auto-save with debounce (500ms after stop typing)
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            onUpdate(schedule.id, { description: value });
        }, 500);
    };

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, []);

    const formatDate = (d?: string | null) => {
        if (!d) return '-';
        return d.substring(0, 10);
    };

    return (
        <>
            <div className="detail-overlay" onClick={onClose} />
            <div className="detail-sidebar">
                <div className="detail-header">
                    <h3><FileText size={18} /> {schedule.title || 'Untitled'}</h3>
                    <button className="detail-close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className="detail-meta">
                    <div className="meta-row">
                        <span className="meta-label">시작일</span>
                        <span>{formatDate(schedule.startDate)}</span>
                    </div>
                    <div className="meta-row">
                        <span className="meta-label">마감일</span>
                        <span>{formatDate(schedule.endDate)}</span>
                    </div>
                    <div className="meta-row">
                        <span className="meta-label">상태</span>
                        <span>{schedule.status === 'Todo' ? '시작 전' : schedule.status === 'InProgress' ? '진행 중' : '완료'}</span>
                    </div>
                    <div className="meta-row">
                        <span className="meta-label">우선순위</span>
                        <span>{schedule.priority === 'High' ? '높음' : schedule.priority === 'Medium' ? '중간' : schedule.priority === 'Low' ? '낮음' : '-'}</span>
                    </div>
                </div>

                <div className="detail-body">
                    <div className="detail-body-label">📝 세부사항 메모</div>
                    <textarea
                        className="detail-textarea"
                        value={description}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder="이 스케줄에 대한 세부사항, 메모, 참고 링크 등을 자유롭게 적어주세요..."
                    />
                </div>
            </div>
        </>
    );
}
