export interface Restaurant {
    id: number;
    name: string;
    open_time: string; // HH:mm
    close_time: string; // HH:mm
}

export interface Table {
    id: number;
    restaurant_id: number;
    table_number: number;
    capacity: number;
}

export interface Reservation {
    id?: number;
    table_id: number;
    customer_name: string;
    party_size: number;
    start_time: Date;
    end_time: Date;
}