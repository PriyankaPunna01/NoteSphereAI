'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useExitPrompt() {
  const router = useRouter()

  useEffect(() => {
    // Intercept back button
    window.history.pushState(null, '', window.location.href)

    const handlePopState = () => {
      const confirmExit = window.confirm('Are you sure you want to leave this page?')
      if (confirmExit) {
        router.back()
      } else {
        window.history.pushState(null, '', window.location.href)
      }
    }

    // Intercept ALL link clicks on the page
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a')
      if (!target) return

      const href = target.getAttribute('href')
      if (!href || href === window.location.pathname) return

      e.preventDefault()
      e.stopPropagation()

      const confirmExit = window.confirm('Are you sure you want to leave this page?')
      if (confirmExit) {
        router.push(href)
      }
    }

    window.addEventListener('popstate', handlePopState)
    document.addEventListener('click', handleClick, true)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      document.removeEventListener('click', handleClick, true)
    }
  }, [router])
}