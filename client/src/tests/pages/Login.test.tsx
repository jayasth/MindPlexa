require("dotenv").config();

import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Login from "../../../../pages/login";
import { supabase } from "../../__mocks__/supabaseClient";

// Mock Next.js Router
jest.mock("next/router", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      query: { redirectedFrom: "/customRedirect" },
    };
  },
}));

describe("Login Component", () => {
  test("calls Supabase signInWithPassword on form submit", async () => {
    render(<Login />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.click(submitButton);

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password",
    });
  });
});
