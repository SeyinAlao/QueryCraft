'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface AnimatedRuleProps {
  children: ReactNode
  id: string
}

export function AnimatedRule({ children, id }: AnimatedRuleProps) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{
        duration: 0.18,
        ease: [0.4, 0, 0.2, 1], 
      }}
      layout 
      layoutId={id}
    >
      {children}
    </motion.div>
  )
}
