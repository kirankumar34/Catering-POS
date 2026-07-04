export declare class CreateOrderItemDto {
    itemId: string;
    quantity: number;
    rate: number;
}
export declare class CreateOrderDto {
    customerId: string;
    menuId?: string;
    eventDate: string;
    eventType?: string;
    venue?: string;
    numberOfPlates: number;
    pricePerPlate: number;
    discount?: number;
    gst?: number;
    additionalCost?: number;
    deliveryCharges?: number;
    advancePaid?: number;
    notes?: string;
    items?: CreateOrderItemDto[];
}
