import { Category, Status } from './theme';

export interface Neighborhood {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  category: Category;
  image_url: string;
  lat: number;
  lng: number;
  neighborhood_id: string;
  neighborhood_name: string;
  author_name: string;
  author_avatar: string;
  upvotes: number;
  status: Status;
  created_at: string;
  has_upvoted?: boolean;
}
