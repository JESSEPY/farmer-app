"use client";

import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  SendIcon,
  XIcon,
  SquareIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react"

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(
          textarea.scrollHeight,
          maxHeight ?? Number.POSITIVE_INFINITY
        )
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
  icon: React.ReactNode;
  label: string;
  description: string;
  prefix: string;
}

interface AnimatedAIChatProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  isLoading: boolean;
  attachments?: string[];
  onRemoveAttachment?: (index: number) => void;
  showCommandPalette?: boolean;
  onToggleCommandPalette?: () => void;
  commandSuggestions?: CommandSuggestion[];
  activeSuggestion?: number;
  onSelectSuggestion?: (index: number) => void;
}

export function AnimatedAIChat({
  value,
  onChange,
  onSubmit,
  onCancel,
  isLoading,
  attachments = [],
  onRemoveAttachment,
  showCommandPalette = false,
  onToggleCommandPalette,
  commandSuggestions = [],
  activeSuggestion = -1,
  onSelectSuggestion,
}: AnimatedAIChatProps) {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });
  const commandPaletteRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandPalette) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        onSelectSuggestion?.(
          activeSuggestion < commandSuggestions.length - 1 ? activeSuggestion + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onSelectSuggestion?.(
          activeSuggestion > 0 ? activeSuggestion - 1 : commandSuggestions.length - 1
        );
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        if (activeSuggestion >= 0) {
          const selectedCommand = commandSuggestions[activeSuggestion];
          onChange(selectedCommand.prefix + ' ');
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onToggleCommandPalette?.();
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="relative bg-card ring-1 ring-foreground/10 rounded-xl">
      <AnimatePresence>
        {showCommandPalette && (
          <motion.div 
            ref={commandPaletteRef}
            className="absolute left-4 right-4 bottom-full mb-2 bg-popover ring-1 ring-foreground/10 rounded-lg z-50 overflow-hidden"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
          >
            <div className="py-1">
              {commandSuggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.prefix}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer",
                    activeSuggestion === index 
                      ? "bg-primary/10 text-foreground" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  onClick={() => onSelectSuggestion?.(index)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div className="w-5 h-5 flex items-center justify-center text-muted-foreground/60">
                    {suggestion.icon}
                  </div>
                  <div className="font-medium">{suggestion.label}</div>
                  <div className="text-muted-foreground/40 text-xs ml-1">
                    {suggestion.prefix}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask about farming..."
          className={cn(
            "flex min-h-[60px] w-full px-4 py-3",
            "resize-none",
            "bg-transparent",
            "border-none",
            "text-foreground text-sm",
            "focus:outline-none",
            "placeholder:text-muted-foreground/50",
          )}
          style={{
            overflow: "hidden",
          }}
        />
      </div>

      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div 
            className="px-4 pb-3 flex gap-2 flex-wrap"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {attachments.map((file, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2 text-xs bg-muted py-1.5 px-3 rounded-lg text-muted-foreground"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <span>{file}</span>
                <button 
                  onClick={() => onRemoveAttachment?.(index)}
                  className="text-muted-foreground/60 hover:text-foreground transition-colors"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 border-t border-border flex items-center justify-end gap-4">
        {isLoading ? (
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20"
          >
            <SquareIcon className="w-4 h-4 fill-current" />
            <span>Stop</span>
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={onSubmit}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={!value.trim()}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all",
              "flex items-center gap-2",
              value.trim()
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <SendIcon className="w-4 h-4" />
            <span>Send</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <div className="flex items-center ml-1">
        {[1, 2, 3].map((dot) => (
          <motion.div
            key={dot}
            className="w-1.5 h-1.5 bg-primary rounded-full mx-0.5"
            initial={{ opacity: 0.3 }}
            animate={{ 
              opacity: [0.3, 0.9, 0.3],
              scale: [0.85, 1.1, 0.85]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: dot * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface CommandButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export function CommandButton({ icon, label, onClick }: CommandButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-2 px-3 py-2 bg-muted/50 hover:bg-muted rounded-lg text-sm text-muted-foreground hover:text-foreground transition-all relative overflow-hidden group"
    >
      <div className="relative z-10 flex items-center gap-2">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      
      <AnimatePresence>
        {isHovered && (
          <motion.div 
            className="absolute inset-0 bg-primary/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}