export interface Restaurant {
    _id: number;
    companyId: number;
    name: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    location: {
        type: "point";
        coordinates: [number, number];
      }
      company: "Sodexo" | "Compass Group";
    }
    export type Restaurants = Restaurant[];

