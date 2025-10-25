/**
 * Utility functions for handling numeric inputs
 */
import React from 'react';

/**
 * Handle keydown events on numeric inputs to properly clear zero values
 */
export const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const input = e.currentTarget;
  const value = input.value;

  // If backspace is pressed and value is "0", clear it
  if (e.key === 'Backspace' && value === '0') {
    e.preventDefault();
    input.value = '';

    // Trigger onChange event
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
  }
};

/**
 * Handle focus on numeric inputs to select all text for easy replacement
 */
export const handleNumericFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.select();
};

/**
 * Validate and format numeric input
 */
export const handleNumericChange = (
  value: string,
  onChange: (value: string) => void,
  options?: {
    allowDecimal?: boolean;
    allowNegative?: boolean;
    maxDecimals?: number;
  }
) => {
  const { allowDecimal = true, allowNegative = false, maxDecimals = 2 } = options || {};

  // Build regex pattern based on options
  let pattern = allowNegative ? '^-?' : '^';
  pattern += '\\d*';
  if (allowDecimal) {
    pattern += `(\\.\\d{0,${maxDecimals}})?`;
  }
  pattern += '$';

  const regex = new RegExp(pattern);

  // Allow empty string or valid number
  if (value === '' || regex.test(value)) {
    onChange(value);
  }
};

/**
 * Props for numeric input components
 */
export interface NumericInputProps {
  value: string | number;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  allowDecimal?: boolean;
  allowNegative?: boolean;
  maxDecimals?: number;
}

/**
 * Enhanced numeric input handler with all features
 */
export const useNumericInput = (
  initialValue: string | number = '',
  options?: {
    allowDecimal?: boolean;
    allowNegative?: boolean;
    maxDecimals?: number;
  }
) => {
  const [value, setValue] = React.useState(String(initialValue));

  const handleChange = (newValue: string) => {
    handleNumericChange(newValue, setValue, options);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    handleNumericKeyDown(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    handleNumericFocus(e);
  };

  return {
    value,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    onFocus: handleFocus,
  };
};
