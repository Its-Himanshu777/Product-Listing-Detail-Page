export type Review = {
  rating: number;
  comment: string;
  reviewerName: string;
};

export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  brand?: string;
  price: number;
  discountPercentage?: number;
  rating: number;
  thumbnail: string;
  images: string[];
  reviews?: Review[];
};

export type Category = {
  slug: string;
  name: string;
};

export type ProductResponse = {
  products: Product[];
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type LocationStatus = "idle" | "loading" | "success" | "error";
