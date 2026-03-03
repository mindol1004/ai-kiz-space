import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  maxRating?: number;
}

export default function StarRating({
  value,
  onChange,
  maxRating = 5
}: StarRatingProps) {
  const [hover, setHover] = useState(-1);

  return (
    <div className="flex">
      {[...Array(maxRating)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            key={index}
            type="button"
            className={`text-2xl transition-colors ${{
              'text-yellow-400': ratingValue <= (hover !== -1 ? hover : value),
              'text-gray-300': ratingValue > (hover !== -1 ? hover : value)
            }}`}
            onClick={() => onChange?.(ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(-1)}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}