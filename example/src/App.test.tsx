import { describe, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { App, WrappedApp } from "./App"

describe("App", () => {
  it("Renders Home", () => {
    render(<WrappedApp />)

    expect(
      screen.getByRole("heading", {
        level: 1,
      })
    ).toHaveTextContent("Home")
  })

  it("Renders Not Found for invalid route", () => {
    render(
      <MemoryRouter initialEntries={["/invalid-route"]}>
        <App />
      </MemoryRouter>
    )

    expect(
      screen.getByRole("heading", {
        level: 1,
      })
    ).toHaveTextContent("Not Found")
  })
})
