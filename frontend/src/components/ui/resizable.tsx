import { GripVertical } from "lucide-react"
import * as React from "react"

import { cn } from "@/utils/cn"

interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultSize?: number
  minSize?: number
  maxSize?: number
  onResizePanel?: (size: number) => void
}

const ResizablePanel = React.forwardRef<HTMLDivElement, ResizablePanelProps>(
  (
    {
      className,
      defaultSize = 30,
      minSize = 20,
      maxSize = 80,
      onResizePanel,
      children,
      ...props
    },
    forwardedRef
  ) => {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const resizerRef = React.useRef<HTMLDivElement>(null)
    const [isResizing, setIsResizing] = React.useState(false)
    const [size, setSize] = React.useState(defaultSize)

    // Sync the internal ref with the forwarded ref
    React.useImperativeHandle(forwardedRef, () => containerRef.current as HTMLDivElement)

    const startResizing = React.useCallback((e: React.MouseEvent) => {
      e.preventDefault()
      setIsResizing(true)
    }, [])

    const stopResizing = React.useCallback(() => {
      setIsResizing(false)
    }, [])

    const onMouseMove = React.useCallback(
      (e: MouseEvent) => {
        if (!isResizing || !containerRef.current) return

        const containerRect = containerRef.current.getBoundingClientRect()
        const newSize = ((e.clientX - containerRect.left) / containerRect.width) * 100

        // Constrain size between min and max
        const constrainedSize = Math.max(minSize, Math.min(maxSize, newSize))

        setSize(constrainedSize)
        onResizePanel?.(constrainedSize)
      },
      [isResizing, minSize, maxSize, onResizePanel]
    )

    React.useEffect(() => {
      if (isResizing) {
        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("mouseup", stopResizing)
      }

      return () => {
        window.removeEventListener("mousemove", onMouseMove)
        window.removeEventListener("mouseup", stopResizing)
      }
    }, [isResizing, onMouseMove, stopResizing])

    return (
      <div
        ref={containerRef}
        className={cn("flex h-full w-full", className)}
        {...props}
      >
        <div
          className="overflow-auto"
          style={{ width: `${size}%` }}
        >
          {children}
        </div>
        <div
          ref={resizerRef}
          className="flex w-[6px] cursor-col-resize items-center justify-center bg-transparent hover:bg-zinc-300/40"
          onMouseDown={startResizing}
        >
          <GripVertical className="h-5 w-5 text-zinc-400" />
        </div>
        <div
          className="overflow-auto"
          style={{ width: `${100 - size}%` }}
        />
      </div>
    )
  }
)

ResizablePanel.displayName = "ResizablePanel"

export { ResizablePanel }
