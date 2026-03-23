import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', ...props }, ref) => {
        let variantStyles = ''
        switch (variant) {
            case 'primary':
                variantStyles = 'bg-blue-600 text-white hover:bg-blue-700'
                break
            case 'secondary':
                variantStyles = 'bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700'
                break
            case 'outline':
                variantStyles = 'border border-zinc-300 bg-transparent hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800'
                break
        }

        return (
            <button
                ref={ref}
                className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-600 disabled:pointer-events-none disabled:opacity-50 ${variantStyles} ${className || ''}`}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"
