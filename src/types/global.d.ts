// Type definitions for modules without type declarations
declare module 'input-otp' {
  import { ComponentType } from 'react';
  
  interface InputOTPProps {
    maxLength?: number;
    value?: string;
    onChange?: (value: string) => void;
    render: (props: { slots: any }) => React.ReactNode;
    // Add other props as needed
  }
  
  const InputOTP: ComponentType<InputOTPProps>;
  export default InputOTP;
}

declare module 'react-resizable-panels' {
  import { ComponentType, CSSProperties, ReactNode, Ref } from 'react';
  
  interface PanelProps {
    children: ReactNode;
    defaultSize?: number;
    minSize?: number;
    maxSize?: number;
    order?: number;
    style?: CSSProperties;
    className?: string;
    onResize?: (size: number) => void;
  }
  
  interface PanelGroupProps {
    children: ReactNode;
    direction?: 'horizontal' | 'vertical';
    style?: CSSProperties;
    className?: string;
  }
  
  export const Panel: ComponentType<PanelProps>;
  export const PanelGroup: ComponentType<PanelGroupProps>;
  // Add other exports as needed
}

// Declare missing Radix UI modules
declare module '@radix-ui/react-hover-card';
declare module '@radix-ui/react-label';
declare module '@radix-ui/react-menubar';
declare module '@radix-ui/react-navigation-menu';
declare module '@radix-ui/react-popover';
declare module '@radix-ui/react-radio-group';

// Fix for web-specific types in React Native
type KeyboardEvent = any;
interface Window {
  // Add any window properties you need to use
}

interface Document {
  // Add any document properties you need to use
}

// Add any other global type declarations here
