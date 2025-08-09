/**
 * Tool names as constants
 */
export const TOOLS = {
  NAVIGATE: 'browser_navigate',
  CLICK: 'browser_click',
  FILL: 'browser_fill',
  EXTRACT: 'browser_extract',
  SCREENSHOT: 'browser_screenshot',
  WAIT: 'browser_wait',
  SCROLL: 'browser_scroll',
  HOVER: 'browser_hover',
  KEY_PRESS: 'browser_key_press',
} as const;

export type ToolName = typeof TOOLS[keyof typeof TOOLS];

/**
 * Tool input/output interfaces
 */

// Navigate tool
export interface NavigateInput {
  sessionId: string;
  url: string;
  waitUntilIdle?: boolean;
}

export interface NavigateOutput {
  success: boolean;
  currentUrl: string;
  error?: string;
}

// Click tool
export interface ClickInput {
  sessionId: string;
  selector?: string;
  text?: string;
  xpath?: string;
  coordinates?: { x: number; y: number };
}

export interface ClickOutput {
  success: boolean;
  elementFound: boolean;
  error?: string;
}

// Fill tool
export interface FillInput {
  sessionId: string;
  selector?: string;
  xpath?: string;
  value: string;
  pressEnter?: boolean;
}

export interface FillOutput {
  success: boolean;
  elementFound: boolean;
  error?: string;
}

// Extract tool
export interface ExtractInput {
  sessionId: string;
  selector?: string;
  xpath?: string;
  extractAll?: boolean;
  attributes?: string[];
}

export interface ExtractOutput {
  success: boolean;
  data: any | any[];
  error?: string;
}

// Screenshot tool
export interface ScreenshotInput {
  sessionId: string;
  fullPage?: boolean;
  selector?: string;
}

export interface ScreenshotOutput {
  success: boolean;
  screenshot: string; // base64 encoded
  error?: string;
}

// Wait tool
export interface WaitInput {
  sessionId: string;
  selector?: string;
  xpath?: string;
  timeout?: number;
  waitForHidden?: boolean;
}

export interface WaitOutput {
  success: boolean;
  elementFound: boolean;
  error?: string;
}

// Scroll tool
export interface ScrollInput {
  sessionId: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  amount?: number;
  selector?: string;
  toBottom?: boolean;
  toTop?: boolean;
}

export interface ScrollOutput {
  success: boolean;
  error?: string;
}

// Hover tool
export interface HoverInput {
  sessionId: string;
  selector?: string;
  text?: string;
  xpath?: string;
}

export interface HoverOutput {
  success: boolean;
  elementFound: boolean;
  error?: string;
}

// Key press tool
export interface KeyPressInput {
  sessionId: string;
  key: string;
  modifiers?: string[];
}

export interface KeyPressOutput {
  success: boolean;
  error?: string;
}

/**
 * Union types for all tool inputs/outputs
 */
export type ToolInput = 
  | NavigateInput 
  | ClickInput 
  | FillInput 
  | ExtractInput 
  | ScreenshotInput 
  | WaitInput
  | ScrollInput
  | HoverInput
  | KeyPressInput;

export type ToolOutput = 
  | NavigateOutput 
  | ClickOutput 
  | FillOutput 
  | ExtractOutput 
  | ScreenshotOutput 
  | WaitOutput
  | ScrollOutput
  | HoverOutput
  | KeyPressOutput;