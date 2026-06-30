import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    findAll(): Promise<{
        id: string;
        updatedAt: Date;
        value: string;
        key: string;
    }[]>;
    updateBulk(settings: Record<string, string>): Promise<{
        id: string;
        updatedAt: Date;
        value: string;
        key: string;
    }[]>;
}
