declare class UpdateOrderItemDto {
    itemId: string;
    quantity: number;
    rate: number;
}
export declare class UpdateOrderDto {
    customerId?: string;
    menuId?: string | null;
    eventDate?: string;
    eventType?: string;
    venue?: string;
    numberOfPlates?: number;
    pricePerPlate?: number;
    discount?: number;
    gst?: number;
    additionalCost?: number;
    deliveryCharges?: number;
    advancePaid?: number;
    notes?: string;
    status?: string;
    items?: UpdateOrderItemDto[];
}
export {};
