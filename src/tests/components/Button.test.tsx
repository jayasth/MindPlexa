import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Button from "../../components/Button";

describe("Button", () => {
  test("renders with children", () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    const buttonElement = screen.getByText("Click me");
    expect(buttonElement).toBeInTheDocument();
  });

  test("calls onClick prop when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const buttonElement = screen.getByText("Click me");
    buttonElement.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
