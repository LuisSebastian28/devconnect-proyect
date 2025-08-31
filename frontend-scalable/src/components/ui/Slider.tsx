import * as React from "react"
import { cn } from "../../lib/utils"

interface SliderProps {
  value?: number[]
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number[]) => void
  className?: string
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, min = 0, max = 100, step = 1, value, defaultValue = [min], onValueChange, ...props }, ref) => {
    const trackRef = React.useRef<HTMLDivElement>(null);
    const [values, setValues] = React.useState<number[]>(value || defaultValue);
    const [dragging, setDragging] = React.useState<number | null>(null);

    React.useEffect(() => {
      if (value) {
        setValues(value);
      }
    }, [value]);

    // Calculate percentages for positioning
    const percentages = values.map((value) => ((value - min) / (max - min)) * 100);

    // Handle click on track
    const handleTrackClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (!trackRef.current) return;
      
      const rect = trackRef.current.getBoundingClientRect();
      const percent = (event.clientX - rect.left) / rect.width;
      const newValue = Math.round(min + percent * (max - min));
      
      // For now, we'll just handle single values
      const newValues = [newValue];
      setValues(newValues);
      onValueChange?.(newValues);
    };

    return (
      <div
        ref={ref}
        className={cn("relative w-full touch-none select-none py-2", className)}
        {...props}
      >
        <div
          ref={trackRef}
          className="h-2 w-full rounded-full bg-slate-100"
          onClick={handleTrackClick}
        >
          {/* Range fill */}
          <div
            className="absolute h-2 bg-indigo-600 rounded-full"
            style={{
              left: 0,
              width: `${percentages[0]}%`,
            }}
          />
          
          {/* Thumb */}
          <div
            className="absolute top-1/2 w-4 h-4 -mt-1.5 -ml-2 rounded-full border-2 border-indigo-600 bg-white cursor-pointer"
            style={{ left: `${percentages[0]}%` }}
          />
        </div>
      </div>
    );
  }
);

Slider.displayName = "Slider";

export default Slider
