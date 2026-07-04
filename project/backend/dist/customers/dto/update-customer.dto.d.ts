import { CreateCustomerAddressDto } from './create-customer.dto';
export declare class UpdateCustomerAddressDto extends CreateCustomerAddressDto {
    id?: string;
}
export declare class UpdateCustomerDto {
    name?: string;
    phone?: string;
    altPhone?: string;
    email?: string;
    gstNumber?: string;
    notes?: string;
    addresses?: UpdateCustomerAddressDto[];
}
