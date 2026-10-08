"use client"

import * as React from "react"

import { Input } from "@/components/ui/input"
import { sanitizeLocalPhone } from "@/lib/phone"

type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "onChange"
> & {
  /** The 10 digits after +63, e.g. "9123456789". */
  value: string
  onValueChange: (value: string) => void
}

function PhoneInput({ value, onValueChange, className, ...props }: PhoneInputProps) {
  return (
    <div className="flex">
      <span className="flex h-8 items-center rounded-l-lg border border-r-0 border-input bg-muted px-2.5 text-sm text-muted-foreground">
        +63
      </span>
      <Input
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="912 345 6789"
        className={`rounded-l-none ${className ?? ""}`}
        value={value}
        onChange={(e) => onValueChange(sanitizeLocalPhone(e.target.value))}
        {...props}
      />
    </div>
  )
}

export { PhoneInput }
