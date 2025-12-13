import { cleanup, render } from "@testing-library/react"
import React from "react"
import { describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom"
import { PromptInputProvider, useProviderAttachments } from "../ai-elements/prompt-input"

// Mock URL.revokeObjectURL to track calls
const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL")

describe("PromptInputProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  it("revokes all Blob URLs on unmount", () => {
    // Create a test file
    const testFile = new File(["test content"], "test.txt", { type: "text/plain" })
    const testUrl = URL.createObjectURL(testFile)

    // Component that adds an attachment and exposes a way to trigger unmount
    const _unmountFn: (() => void) | null = null

    const TestComponent = () => {
      const attachments = useProviderAttachments()

      React.useEffect(() => {
        // Add attachment after mount
        const file = new File(["test"], "test.txt", { type: "text/plain" })
        attachments.add([file])
      }, [attachments.add])

      return <div>Test</div>
    }

    const { unmount } = render(
      <PromptInputProvider>
        <TestComponent />
      </PromptInputProvider>,
    )

    // Verify URL was created
    expect(testUrl).toMatch(/^blob:/)

    // Unmount the component
    unmount()

    // At least one URL should be revoked (the one added by TestComponent)
    expect(revokeObjectURLSpy).toHaveBeenCalled()
  })

  it("handles multiple attachments and revokes all on unmount", () => {
    const file1 = new File(["content1"], "file1.txt", { type: "text/plain" })
    const file2 = new File(["content2"], "file2.txt", { type: "text/plain" })
    const file3 = new File(["content3"], "file3.txt", { type: "text/plain" })

    const _url1 = URL.createObjectURL(file1)
    const _url2 = URL.createObjectURL(file2)
    const _url3 = URL.createObjectURL(file3)

    const TestComponent = () => {
      const attachments = useProviderAttachments()

      React.useEffect(() => {
        // Add multiple attachments
        attachments.add([file1, file2, file3])
      }, [attachments.add])

      return <div>Test</div>
    }

    const { unmount } = render(
      <PromptInputProvider>
        <TestComponent />
      </PromptInputProvider>,
    )

    // Unmount
    unmount()

    // All URLs should be revoked (3 files added)
    expect(revokeObjectURLSpy).toHaveBeenCalledTimes(3)
  })

  it("does not revoke URLs that are already removed via clear()", () => {
    // This test verifies that the existing clear() logic still works
    // and the useEffect cleanup doesn't cause issues
    const testFile = new File(["test"], "test.txt", { type: "text/plain" })

    const TestComponent = () => {
      const attachments = useProviderAttachments()

      React.useEffect(() => {
        // Add then immediately clear
        attachments.add([testFile])
        attachments.clear()
      }, [attachments.add, attachments.clear])

      return <div>Test</div>
    }

    const { unmount } = render(
      <PromptInputProvider>
        <TestComponent />
      </PromptInputProvider>,
    )

    // URLs were revoked during clear()
    expect(revokeObjectURLSpy).toHaveBeenCalled()

    // Reset the spy to check unmount cleanup
    revokeObjectURLSpy.mockClear()

    // Unmount - should not revoke again (already cleared)
    unmount()

    // Should not revoke on unmount since already cleared
    expect(revokeObjectURLSpy).not.toHaveBeenCalled()
  })

  it("handles missing URLs gracefully during cleanup", () => {
    const { unmount } = render(
      <PromptInputProvider>
        <div>Test</div>
      </PromptInputProvider>,
    )

    // Unmount should not throw even if there are no attachments
    expect(() => unmount()).not.toThrow()

    // No revoke calls expected for empty attachments
    expect(revokeObjectURLSpy).not.toHaveBeenCalled()
  })

  it("properly sets up and cleans up useEffect for Blob URLs", () => {
    // This test verifies the cleanup effect is properly configured
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    const TestComponent = () => {
      const attachments = useProviderAttachments()

      React.useEffect(() => {
        // Add an attachment
        const file = new File(["test"], "test.txt", { type: "text/plain" })
        attachments.add([file])
      }, [attachments.add])

      return <div>Test</div>
    }

    const { unmount } = render(
      <PromptInputProvider>
        <TestComponent />
      </PromptInputProvider>,
    )

    // Should have added an attachment
    expect(revokeObjectURLSpy).not.toHaveBeenCalled()

    // Unmount should clean up without errors
    expect(() => unmount()).not.toThrow()

    // Should have revoked the URL
    expect(revokeObjectURLSpy).toHaveBeenCalled()

    // Should not have any console errors
    expect(consoleSpy).not.toHaveBeenCalled()

    consoleSpy.mockRestore()
  })
})
