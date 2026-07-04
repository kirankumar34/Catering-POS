import { ActivityLogService } from './activity-log.service';
export declare class ActivityLogController {
    private readonly activityLogService;
    constructor(activityLogService: ActivityLogService);
    findAll(limit?: string): Promise<({
        user: {
            role: {
                name: string;
            };
            username: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        action: string;
        details: string | null;
    })[]>;
}
