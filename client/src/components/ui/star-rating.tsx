import { useState } from "react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  count?: number;
  className?: string;
};

export function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = "md",
  count = 5,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const handleMouseEnter = (index: number) => {
    if (readOnly) return;
    setHoverValue(index);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverValue(null);
  };

  const handleClick = (index: number) => {
    if (readOnly) return;
    onChange?.(index);
  };

  const renderStar = (index: number) => {
    const filled = (hoverValue !== null ? index <= hoverValue : index <= value);
    
    return (
      <span
        key={index}
        className={cn(
          "material-icons text-yellow-400 cursor-default",
          !readOnly && "cursor-pointer",
          sizeClasses[size]
        )}
        onMouseEnter={() => handleMouseEnter(index)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleClick(index)}
      >
        {filled ? "star" : "star_border"}
      </span>
    );
  };

  return (
    <div className={cn("flex", className)}>
      {[...Array(count)].map((_, i) => renderStar(i + 1))}
    </div>
  );
}
