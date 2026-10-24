'use client';

import React, { useState, useId } from 'react';
import { parsePhoneNumberFromString, AsYouType, CountryCode } from 'libphonenumber-js';

export interface PhoneChangeValue {
  raw: string;
  e164: string;
  isValid: boolean;
  country: CountryCode;
}

interface PhoneInputProps {
  value: string;
  onChange: (val: PhoneChangeValue) => void;
  disabled?: boolean;
  defaultCountry?: CountryCode;
  placeholder?: string;
  className?: string;
  id?: string;
  autoFocus?: boolean;
}

const SUPPORTED_COUNTRIES: { code: CountryCode; label: string; dialCode: string; flag: string }[] = [
  { code: 'IN', label: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'US', label: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', label: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'AE', label: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'CA', label: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', label: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'SG', label: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'DE', label: 'Germany', dialCode: '+49', flag: '🇩🇪' },
];

export function PhoneInput({
  value,
  onChange,
  disabled = false,
  defaultCountry = 'IN',
  placeholder,
  className = '',
  id,
  autoFocus = false,
}: PhoneInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const [country, setCountry] = useState<CountryCode>(defaultCountry);
  const [nationalNumber, setNationalNumber] = useState<string>(() => {
    if (!value) return '';
    try {
      const parsed = parsePhoneNumberFromString(value, defaultCountry);
      return parsed ? parsed.nationalNumber : value.replace(/^\+\d+\s*/, '').replace(/\D/g, '');
    } catch {
      return value.replace(/\D/g, '');
    }
  });
  const [prevValue, setPrevValue] = useState(value);

  // Sync internal state when external value prop changes during render
  if (value !== prevValue) {
    setPrevValue(value);
    if (!value) {
      setNationalNumber('');
    } else {
      try {
        const parsed = parsePhoneNumberFromString(value, country);
        if (parsed) {
          if (parsed.country && parsed.country !== country) {
            setCountry(parsed.country);
          }
          setNationalNumber(parsed.nationalNumber);
        } else {
          setNationalNumber(value.replace(/^\+\d+\s*/, '').replace(/\D/g, ''));
        }
      } catch {
        setNationalNumber(value.replace(/\D/g, ''));
      }
    }
  }

  const handleCountryChange = (newCountry: CountryCode) => {
    setCountry(newCountry);
    evaluateAndEmit(nationalNumber, newCountry);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Allow digits and spaces/hyphens for visual formatting
    const cleanedDigits = rawVal.replace(/\D/g, '');
    const formatter = new AsYouType(country);
    const formatted = formatter.input(cleanedDigits);
    setNationalNumber(formatted);
    evaluateAndEmit(cleanedDigits, country);
  };

  const evaluateAndEmit = (numberStr: string, currentCountry: CountryCode) => {
    try {
      const parsed = parsePhoneNumberFromString(numberStr, currentCountry);
      if (parsed && parsed.isValid()) {
        onChange({
          raw: numberStr,
          e164: parsed.number, // standard +91... format
          isValid: true,
          country: currentCountry,
        });
      } else {
        const selected = SUPPORTED_COUNTRIES.find((c) => c.code === currentCountry);
        const dial = selected ? selected.dialCode : '+91';
        onChange({
          raw: numberStr,
          e164: numberStr ? `${dial}${numberStr.replace(/\D/g, '')}` : '',
          isValid: false,
          country: currentCountry,
        });
      }
    } catch {
      onChange({
        raw: numberStr,
        e164: '',
        isValid: false,
        country: currentCountry,
      });
    }
  };

  const currentCountryObj =
    SUPPORTED_COUNTRIES.find((c) => c.code === country) || SUPPORTED_COUNTRIES[0];

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center rounded-xl bg-zinc-50 dark:bg-[#18181E] border border-zinc-300 dark:border-zinc-800 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/50 transition-all overflow-hidden">
        {/* Country Code Selector */}
        <div className="relative flex items-center bg-zinc-100 dark:bg-[#121216] border-r border-zinc-300 dark:border-zinc-800 px-3 py-2.5 min-h-[44px]">
          <span className="text-base mr-1.5 select-none" aria-hidden="true">
            {currentCountryObj.flag}
          </span>
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 mr-1 select-none">
            {currentCountryObj.dialCode}
          </span>
          <select
            aria-label="Select Country Code"
            disabled={disabled}
            value={country}
            onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed"
          >
            {SUPPORTED_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                {c.flag} {c.label} ({c.dialCode})
              </option>
            ))}
          </select>
          <svg
            className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 pointer-events-none ml-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Local Number Input */}
        <input
          id={inputId}
          type="tel"
          disabled={disabled}
          autoFocus={autoFocus}
          value={nationalNumber}
          onChange={handleInputChange}
          placeholder={placeholder || (country === 'IN' ? '98765 43210' : 'Mobile number')}
          autoComplete="tel-national"
          className="flex-1 bg-transparent px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}
