export interface StreamSessionGuard {
  start: () => number
  isActive: (sessionId: number) => boolean
  runIfActive: (sessionId: number, callback: () => void) => void
  finish: (sessionId: number, callback: () => void) => void
  stop: (sessionId: number, callback: () => void) => void
}

export function createStreamSessionGuard(): StreamSessionGuard {
  let activeSessionId = 0

  const isActive = (sessionId: number) => sessionId === activeSessionId

  const finish = (sessionId: number, callback: () => void) => {
    if (!isActive(sessionId)) return
    callback()
    activeSessionId += 1
  }

  return {
    start: () => {
      activeSessionId += 1
      return activeSessionId
    },
    isActive,
    runIfActive: (sessionId, callback) => {
      if (isActive(sessionId)) callback()
    },
    finish,
    stop: finish,
  }
}
