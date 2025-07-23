"use client"

import { useEffect } from 'react'

export function MobileOptimizations() {
  useEffect(() => {
    // Prevent zoom on input focus for iOS Safari
    const addMaximumScaleToMetaViewport = () => {
      const el = document.querySelector('meta[name=viewport]')
      if (el !== null) {
        let content = el.getAttribute('content')
        if (content) {
          let re = /maximum-scale=[0-9.]+/g
          if (re.test(content)) {
            content = content.replace(re, 'maximum-scale=1.0')
          } else {
            content = [content, 'maximum-scale=1.0'].join(', ')
          }
          el.setAttribute('content', content)
        }
      }
    }

    const disableMaximumScaleOnMetaViewport = () => {
      const el = document.querySelector('meta[name=viewport]')
      if (el !== null) {
        let content = el.getAttribute('content')
        if (content) {
          let re = /maximum-scale=[0-9.]+/g
          if (re.test(content)) {
            content = content.replace(re, 'maximum-scale=5.0')
          }
          el.setAttribute('content', content)
        }
      }
    }

    // Prevent horizontal scroll
    const preventHorizontalScroll = () => {
      document.body.style.overflowX = 'hidden'
      document.documentElement.style.overflowX = 'hidden'
    }

    // Handle orientation change
    const handleOrientationChange = () => {
      // Small delay to ensure viewport adjusts
      setTimeout(() => {
        // Force height recalculation
        document.body.style.height = '100vh'
        setTimeout(() => {
          document.body.style.height = 'auto'
        }, 100)
      }, 500)
    }

    // Handle safe area insets for devices with notches
    const handleSafeAreaInsets = () => {
      const root = document.documentElement
      if (CSS.supports('padding: env(safe-area-inset-top)')) {
        root.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)')
        root.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)')
        root.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)')
        root.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)')
      }
    }

    // Add event listeners for input focus/blur
    const inputElements = document.querySelectorAll('input, select, textarea')
    
    inputElements.forEach((input) => {
      input.addEventListener('focus', addMaximumScaleToMetaViewport, false)
      input.addEventListener('blur', disableMaximumScaleOnMetaViewport, false)
    })

    // Optimize touch events
    document.addEventListener('touchstart', () => {}, { passive: true })
    document.addEventListener('touchmove', () => {}, { passive: true })
    
    // Add orientation change listener
    window.addEventListener('orientationchange', handleOrientationChange, false)
    
    // Initialize optimizations
    preventHorizontalScroll()
    handleSafeAreaInsets()

    // Cleanup function
    return () => {
      inputElements.forEach((input) => {
        input.removeEventListener('focus', addMaximumScaleToMetaViewport, false)
        input.removeEventListener('blur', disableMaximumScaleOnMetaViewport, false)
      })
      window.removeEventListener('orientationchange', handleOrientationChange, false)
    }
  }, [])

  return null
}
