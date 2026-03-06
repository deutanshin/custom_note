export interface Schedule {
    id: string;
    title: string;
    description?: string | null;
    month?: string;
    startDate?: string;
    endDate?: string;
    priority?: string | null;
    status: string; // 'Todo', 'InProgress', 'Done', 'Begin'
    isCompleted: boolean;
    completedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type ViewMode = 'list' | 'board' | 'calendar';
