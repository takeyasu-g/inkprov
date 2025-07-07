"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps extends React.SVGProps<SVGSVGElement> {
  progress: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  indicatorColor?: string;
  children?: React.ReactNode;
}

const CircularProgress = React.forwardRef<SVGSVGElement, CircularProgressProps>(
  (
    {
      className,
      progress = 0,
      size = 40,
      strokeWidth = 4,
      trackColor = "rgb(229, 231, 235)", // gray-200
      indicatorColor = "rgb(59, 130, 246)", // blue-500
      children,
      ...props
    },
    ref
  ) => {
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          ref={ref}
          className={cn("rotate-[-90deg]", className)}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
          {...props}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={indicatorColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.3s ease",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      </div>
    );
  }
);

CircularProgress.displayName = "CircularProgress";

export { CircularProgress }; 