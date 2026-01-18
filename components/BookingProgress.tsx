'use client';

import React from 'react';

interface BookingProgressProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: 'Select Date', icon: '📅' },
  { number: 2, label: 'Choose Time', icon: '⏰' },
  { number: 3, label: 'Your Details', icon: '✍️' },
  { number: 4, label: 'Confirm', icon: '✓' },
];

export const BookingProgress: React.FC<BookingProgressProps> = ({
  currentStep,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
          <div
            className="h-full bg-green-600 transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;
          const isPending = step.number > currentStep;

          return (
            <div key={step.number} className="flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div
                className={`
                  w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                  text-lg sm:text-xl font-semibold transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-green-600 text-white shadow-lg scale-110'
                      : isActive
                      ? 'bg-green-600 text-white shadow-lg ring-4 ring-green-200 scale-110'
                      : 'bg-gray-200 text-gray-400'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{step.icon}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="mt-2 text-center">
                <p
                  className={`
                    text-xs sm:text-sm font-medium
                    ${
                      isCompleted || isActive
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }
                  `}
                >
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
