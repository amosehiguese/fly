import { Star } from "lucide-react";
import React from "react";

const StarRating = ({
  rating,
  iconColor = "#FFD700",
  iconSize = 16,
}: {
  rating: number;
  iconColor?: string;
  iconSize?: number;
}) => {
  // Round the rating to the nearest 0.5
  const roundedRating = Math.round(rating * 2) / 2;

  // Create an array to hold the star icons
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= roundedRating) {
      stars.push(
        <Star
          key={i}
          name="star"
          fill="#FFD700"
          color={iconColor}
          size={iconSize}
          className="text-black mx-[2px]"
        />
      );
    } else if (i === Math.ceil(roundedRating) && roundedRating % 1 !== 0) {
      stars.push(
        <Star
          key={i}
          fill="#FFD700"
          name="star-half-full"
          color={iconColor}
          size={iconSize}
          className="text-black mx-[2px]"
        />
      );
    } else {
      stars.push(
        <Star
          key={i}
          name="star-o"
          color={iconColor}
          size={iconSize}
          className="text-black  mx-[2px]"
        />
      );
    }
  }

  return <div className="flex items-center">{stars}</div>;
};

export default StarRating;
