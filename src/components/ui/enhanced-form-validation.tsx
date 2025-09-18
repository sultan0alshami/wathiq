import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
  type?: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  messages: Array<{ message: string; type: 'error' | 'warning' | 'info' }>;
}

export function useFormValidation() {
  const validateField = React.useCallback((value: any, rules: ValidationRule[]): ValidationResult => {
    const messages: Array<{ message: string; type: 'error' | 'warning' | 'info' }> = [];
    let isValid = true;

    rules.forEach(rule => {
      if (!rule.validate(value)) {
        messages.push({
          message: rule.message,
          type: rule.type || 'error'
        });
        if (rule.type !== 'warning' && rule.type !== 'info') {
          isValid = false;
        }
      }
    });

    return { isValid, messages };
  }, []); // Empty dependency array as rules are passed directly.

  const validateForm = (fields: Record<string, { value: any; rules: ValidationRule[] }>): boolean => {
    let formIsValid = true;
    
    Object.values(fields).forEach(field => {
      const result = validateField(field.value, field.rules);
      if (!result.isValid) {
        formIsValid = false;
      }
    });

    return formIsValid;
  };

  return { validateField, validateForm };
}

interface ValidationMessageProps {
  result: ValidationResult;
  className?: string;
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({ result, className }) => {
  if (result.messages.length === 0) return null;

  return (
    <div className={cn("space-y-1", className)}>
      {result.messages.map((msg, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center gap-2 text-sm",
            {
              "text-destructive": msg.type === 'error',
              "text-warning": msg.type === 'warning',
              "text-muted-foreground": msg.type === 'info'
            }
          )}
        >
          {msg.type === 'error' && <AlertTriangle className="w-3 h-3" />}
          {msg.type === 'warning' && <Info className="w-3 h-3" />}
          {msg.type === 'info' && <Info className="w-3 h-3" />}
          <span>{msg.message}</span>
        </div>
      ))}
    </div>
  );
};

// Common validation rules
export const ValidationRules = {
  required: (message = 'هذا الحقل مطلوب'): ValidationRule => ({
    validate: (value) => value !== null && value !== undefined && value !== '',
    message
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value) => typeof value === 'string' && value.length >= min,
    message: message || `يجب أن يحتوي على ${min} أحرف على الأقل`
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => typeof value === 'string' && value.length <= max,
    message: message || `يجب أن لا يزيد عن ${max} حرف`
  }),

  number: (message = 'يجب أن يكون رقم صالح'): ValidationRule => ({
    // This rule validates if the value is a finite number. 
    // It's recommended to use this in conjunction with `ValidationRules.required`
    // if empty strings or pure whitespace should not be considered valid.
    validate: (value) => {
      if (typeof value === 'string' && value.trim() === '') return false;
      return !isNaN(Number(value)) && isFinite(Number(value));
    },
    message
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validate: (value) => !isNaN(Number(value)) && Number(value) >= min,
    message: message || `يجب أن لا يقل عن ${min}`
  }),

  positiveNumber: (message = 'يجب أن يكون رقم موجب'): ValidationRule => ({
    validate: (value) => !isNaN(Number(value)) && Number(value) > 0,
    message
  }),

  email: (message = 'البريد الإلكتروني غير صالح'): ValidationRule => ({
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),

  arabicText: (message = 'يجب أن يحتوي على نص عربي'): ValidationRule => ({
    // Enforces that the field must contain at least one Arabic character.
    // Changed default type to 'error' for strict enforcement of Arabic text input.
    validate: (value) => /[\u0600-\u06FF]/.test(value),
    message,
    type: 'error'
  }),

  noSpecialChars: (message = 'لا يسمح بالرموز الخاصة'): ValidationRule => ({
    // This rule allows English letters (a-z, A-Z), numbers (0-9), Arabic characters (\u0600-\u06FF), and spaces.
    // If other characters (e.g., hyphens, apostrophes, periods) are needed for specific input types,
    // the regex should be extended or a more specific validation rule should be created.
    validate: (value) => /^[a-zA-Z0-9\u0600-\u06FF\s]*$/.test(value),
    message
  })
};