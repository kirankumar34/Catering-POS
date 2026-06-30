export declare class CreateCustomerAddressDto {
    address: string;
    location?: string;
    isDefault?: boolean;
}
export declare class CreateCustomerDto {
    name: string;
    phone: string;
    altPhone?: string;
    email?: string;
    gstNumber?: string;
    notes?: string;
    addresses?: CreateCustomerAddressDto[];
}
