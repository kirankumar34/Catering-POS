import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        role: {
            id: string;
            name: string;
            description: string | null;
        };
        username: string;
        email: string | null;
        id: string;
        createdAt: Date;
    }[]>;
    create(dto: CreateUserDto): Promise<{
        role: {
            id: string;
            name: string;
            description: string | null;
        };
        username: string;
        email: string | null;
        id: string;
        createdAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        role: {
            id: string;
            name: string;
            description: string | null;
        };
        username: string;
        email: string | null;
        id: string;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
