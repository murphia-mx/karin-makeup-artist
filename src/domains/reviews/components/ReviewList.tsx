import { ReviewCard } from './ReviewCard';
import type { Review } from '../types/Review';

interface ReviewListProps {
  reviews: Review[];
  featuredIds?: string[];
}

export const ReviewList = ({ reviews, featuredIds = [] }: ReviewListProps) => {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch">
      {reviews.map((review, index) => (
        <ReviewCard 
          key={review.id} 
          review={review} 
          index={index} 
          isFeatured={featuredIds.includes(review.id)} 
        />
      ))}
    </div>
  );
};
