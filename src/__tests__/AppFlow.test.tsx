import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";
import { HttpError } from "../api/http";
import { productsApi } from "../api/products";
import type { Category, Product } from "../types/product";

vi.mock("../api/products", () => ({
  productsApi: {
    list: vi.fn(),
    byCategory: vi.fn(),
    categories: vi.fn(),
    byId: vi.fn(),
  },
}));

const mockCategories: Category[] = [
  { slug: "smartphones", name: "Smartphones" },
  { slug: "groceries", name: "Groceries" },
];

const smartphoneProducts: Product[] = Array.from({ length: 14 }, (_, i) => ({
  id: i + 1,
  title: `Smartphone ${i + 1}`,
  description: `Detailed specs for Smartphone ${i + 1}`,
  category: "smartphones",
  brand: i % 2 === 0 ? "Apple" : "Samsung",
  price: 100 + i * 50,
  rating: 4.5,
  thumbnail: `https://example.com/phone-${i + 1}.jpg`,
  images: [`https://example.com/phone-${i + 1}.jpg`],
}));

const groceryProducts: Product[] = [
  {
    id: 101,
    title: "Organic Apples",
    description: "Fresh crisp apples",
    category: "groceries",
    price: 4.99,
    rating: 4.7,
    thumbnail: "https://example.com/apples.jpg",
    images: ["https://example.com/apples.jpg"],
  },
];

const allProducts: Product[] = [...smartphoneProducts, ...groceryProducts];

function renderApp(initialEntry = "/") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <App />
    </MemoryRouter>,
  );
}

describe("Product listing and detail flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productsApi.categories).mockResolvedValue(mockCategories);
    vi.mocked(productsApi.list).mockResolvedValue({
      products: allProducts,
      total: allProducts.length,
      skip: 0,
      limit: 0,
    });
    vi.mocked(productsApi.byCategory).mockImplementation(async (slug) => ({
      products: slug === "groceries" ? groceryProducts : smartphoneProducts,
    }));
    vi.mocked(productsApi.byId).mockImplementation(async (id) => {
      const found = allProducts.find((item) => String(item.id) === id);
      if (!found) throw new HttpError(404, "Not found");
      return found;
    });
  });

  it("shows loading state then renders products, and supports Retry on error", async () => {
    const user = userEvent.setup();
    vi.mocked(productsApi.list).mockRejectedValueOnce(new TypeError("Failed"));

    renderApp("/");

    expect(screen.getByLabelText("Loading products")).toBeInTheDocument();

    expect(
      await screen.findByText("We couldn't load the products."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Smartphone 1")).toBeInTheDocument();
    expect(productsApi.list).toHaveBeenCalledTimes(2);
  });

  it("resets page to 1 when changing a filter", async () => {
    const user = userEvent.setup();
    renderApp("/");

    expect(await screen.findByText("Smartphone 1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText("Smartphone 13")).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /^Apple/ }));
    expect(screen.getByText("Smartphone 1")).toBeInTheDocument();
    expect(screen.getByText("7 results")).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Product pages" }),
    ).not.toBeInTheDocument();
  });

  it("scopes brands to category, clears stale brands on category switch, and shows empty brand notice", async () => {
    const user = userEvent.setup();
    renderApp("/");

    await screen.findByText("Smartphone 1");

    await user.selectOptions(screen.getByLabelText("Category"), "smartphones");
    expect(
      await screen.findByRole("checkbox", { name: /^Apple/ }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: /^Apple/ }));

    await user.selectOptions(screen.getByLabelText("Category"), "groceries");
    expect(await screen.findByText("Organic Apples")).toBeInTheDocument();
    expect(screen.getByText("No brands in this category")).toBeInTheDocument();
  });

  it("shows validation message when min price exceeds max price without filtering products", async () => {
    const user = userEvent.setup();
    renderApp("/");

    await screen.findByText("Smartphone 1");

    const minInput = screen.getByLabelText("Minimum price");
    const maxInput = screen.getByLabelText("Maximum price");

    await user.type(minInput, "500");
    await user.type(maxInput, "100");

    expect(
      await screen.findByText("Min can't be more than max"),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("15 results")).toBeInTheDocument();
    });
  });

  it("keeps filters and uses cached data when navigating from detail Back button", async () => {
    const user = userEvent.setup();
    renderApp("/");

    await screen.findByText("Smartphone 1");

    await user.selectOptions(screen.getByLabelText("Category"), "smartphones");
    await waitFor(() => {
      expect(productsApi.byCategory).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole("checkbox", { name: /^Apple/ }));
    expect(screen.getByText("7 results")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "View Smartphone 1" }));

    expect(
      await screen.findByText("Detailed specs for Smartphone 1"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "← Back to results" }));

    expect(await screen.findByText("7 results")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /^Apple/ })).toBeChecked();
    expect(productsApi.byCategory).toHaveBeenCalledTimes(1);
  });

  it("filters products via header search and preserves query across detail Back navigation", async () => {
    const user = userEvent.setup();
    renderApp("/");

    await screen.findByText("Smartphone 1");

    const searchInput = screen.getByPlaceholderText("Search products...");
    await user.type(searchInput, "Apples{Enter}");

    expect(await screen.findByText("1 result")).toBeInTheDocument();
    expect(screen.getByText("Organic Apples")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "View Organic Apples" }));
    expect(await screen.findByText("Fresh crisp apples")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "← Back to results" }));
    expect(await screen.findByText("1 result")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search products...")).toHaveValue(
      "Apples",
    );
  });

  it("opens cart, recently viewed, and account popovers when clicking header action icons", async () => {
    const user = userEvent.setup();
    renderApp("/");

    await screen.findByText("Smartphone 1");

    await user.click(screen.getByRole("button", { name: "Shopping cart" }));
    expect(
      screen.getByRole("dialog", { name: "Shopping cart summary" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "View Smartphone 1" }));
    expect(
      await screen.findByText("Detailed specs for Smartphone 1"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Recently viewed products" }),
    );
    const activityDialog = screen.getByRole("dialog", {
      name: "Recently viewed products",
    });
    expect(activityDialog).toHaveTextContent("Smartphone 1");

    await user.click(screen.getByRole("button", { name: "Account" }));
    const accountDialog = screen.getByRole("dialog", { name: "Account" });
    expect(accountDialog).toBeInTheDocument();
    await user.type(screen.getByLabelText("Email address"), "alex@example.com");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(screen.getByText(/Signed in as/)).toBeInTheDocument();
    expect(screen.getByText("alex@example.com")).toBeInTheDocument();
  });

  it("shows Product not found for 404 product and NotFound for unknown routes", async () => {
    renderApp("/product/9999");
    expect(await screen.findByText("Product not found")).toBeInTheDocument();

    renderApp("/does-not-exist");
    expect(await screen.findByText("Page not found")).toBeInTheDocument();
  });
});
