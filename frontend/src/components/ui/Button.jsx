import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
        default: "bg-[#2d6a4f] hover:bg-[#74c69d] text-[#f8faf9] shadow-md hover:shadow-lg transition-all",
        destructive: "bg-red-600 hover:bg-red-700 text-[#f8faf9] shadow-md hover:shadow-lg transition-all",
        outline: "border-2 border-[#d8e2dc] dark:border-slate-600 bg-transparent hover:bg-[#f8faf9] dark:hover:bg-slate-800 hover:border-[#2d6a4f] transition-all",
        secondary: "bg-[#74c69d] dark:bg-slate-700 text-[#2d6a4f] dark:text-[#f8faf9] hover:bg-[#2ec4b6] dark:hover:bg-slate-600 transition-all",
        ghost: "hover:bg-[#f8faf9] dark:hover:bg-slate-800 hover:text-[#2d6a4f] dark:hover:text-[#74c69d] transition-all",
        link: "text-[#2d6a4f] dark:text-[#74c69d] underline-offset-4 hover:underline hover:text-[#74c69d] dark:hover:text-[#2ec4b6]",
    }

    const sizes = {
        default: "h-11 px-4 py-2 rounded-lg min-h-[44px]",
        sm: "h-10 rounded-lg px-3 text-sm min-h-[40px]",
        lg: "h-12 rounded-lg px-8 text-base min-h-[48px]",
        icon: "h-11 w-11 rounded-lg min-h-[44px] min-w-[44px]",
    }

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d6a4f] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                variants[variant],
                sizes[size],
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Button.displayName = "Button"

export { Button }
