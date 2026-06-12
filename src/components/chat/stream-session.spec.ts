import { describe, expect, it, vi } from "vitest"
import { createStreamSessionGuard } from "./stream-session"

describe("createStreamSessionGuard", () => {
  it("finalizes immediately on stop and ignores late stream callbacks", () => {
    const guard = createStreamSessionGuard()
    const sessionId = guard.start()
    const finalize = vi.fn()

    guard.stop(sessionId, () => finalize("已停止生成。"))
    guard.runIfActive(sessionId, () => finalize("迟到的模型输出"))

    expect(finalize).toHaveBeenCalledTimes(1)
    expect(finalize).toHaveBeenCalledWith("已停止生成。")
  })
})
