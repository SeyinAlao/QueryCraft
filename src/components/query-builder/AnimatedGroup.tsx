'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'

interface AnimatedGroupChildrenProps {
  isVisible: boolean
  children: ReactNode
}

export function AnimatedGroupChildren({
  isVisible,
  children,
}: AnimatedGroupChildrenProps) {
  return (
    <AnimatePresence initial={false}>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
            opacity: { duration: 0.15, ease: 'easeOut' },
          }}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface AnimatedGroupEntryProps {
  children: ReactNode
  id: string
}

export function AnimatedGroupEntry({ children, id }: AnimatedGroupEntryProps) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      layout
      layoutId={id}
    >
      {children}
    </motion.div>
  )
}
