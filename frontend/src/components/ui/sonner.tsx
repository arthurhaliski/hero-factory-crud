"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

// Define default toast options, overriding CSS variables for success and error
const defaultToastOptions: ToasterProps['toastOptions'] = {
  classNames: {
    // Override CSS variables directly using Tailwind arbitrary properties
    success: `
      group toast 
      [--normal-bg:theme(colors.green.100)] 
      [--normal-text:theme(colors.green.900)] 
      [--normal-border:theme(colors.green.200)] 
      dark:[--normal-bg:theme(colors.green.900/0.3)] 
      dark:[--normal-text:theme(colors.green.200)] 
      dark:[--normal-border:theme(colors.green.800/0.5)]
    `,
    // Add Error styles
    error: `
      group toast 
      [--normal-bg:theme(colors.red.100)] 
      [--normal-text:theme(colors.red.900)] 
      [--normal-border:theme(colors.red.200)] 
      dark:[--normal-bg:theme(colors.red.900/0.3)] 
      dark:[--normal-text:theme(colors.red.200)] 
      dark:[--normal-border:theme(colors.red.800/0.5)]
    `,
  },
};

const Toaster = ({ toastOptions, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  // Merge default options with any passed-in options
  const mergedToastOptions = { 
      ...defaultToastOptions, 
      ...toastOptions, 
      classNames: { 
          ...defaultToastOptions?.classNames, 
          ...toastOptions?.classNames 
      } 
  };

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      toastOptions={mergedToastOptions}
      {...props}
    />
  )
}

export { Toaster }
