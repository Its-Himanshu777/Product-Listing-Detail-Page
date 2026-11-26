export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  brand?: string;
  price: number;
  rating: number;
  thumbnail: string;
  images?: string[];
};

export type Category = {
  slug: string;
  name: string;
};

export type ProductListResponse = {
  products: Product[];
  total?: number;
  skip?: number;
  limit?: number;
};
