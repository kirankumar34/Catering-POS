import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        id: string;
        role: {
            id: string;
            name: string;
            description: string | null;
        };
        username: string;
        email: string | null;
        createdAt: Date;
    }[]>;
    create(dto: CreateUserDto): Promise<{
        id: string;
        role: {
            id: string;
            name: string;
            description: string | null;
        };
        username: string;
        email: string | null;
        createdAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        role: {
            id: string;
            name: string;
            description: string | null;
        };
        username: string;
        email: string | null;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
