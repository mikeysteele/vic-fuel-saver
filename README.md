# ⛽ FuelSaver

**FuelSaver** is a high-performance, map-centric web application designed to
help drivers in Victoria, Australia, find the best fuel prices in real-time.
Built with **SolidStart** and powered by the **Service Victoria Fair Fuel Open
Data API**, it provides live price tracking, intelligent filtering, and
comparative analytics.

## ✨ Features

- 🗺️ **Interactive Fuel Map**: Clustered markers for hundreds of stations with
  instant price visibility.
- 📊 **Dynamic Area Metrics**: Automatically calculates Min, Max, and Average
  prices for the currently visible map viewport.
- ⚖️ **Price Benchmarking**: Real-time comparison of station prices against both
  the State and local Area averages.
- 🔍 **Advanced Filtering**: Filter by fuel type (U91, P98, Diesel, etc.) and
  brand.
- 💾 **Persistent Preferences**: Your favorite fuel types and brands are
  automatically saved across sessions.
- 🌑 **Dark Mode**: Seamless support for both light and dark themes, including
  map tiles.
- 📱 **Responsive Design**: Optimized for both mobile and desktop with a
  combined Map/List view.

## 🛠️ Technical Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) with
  [SolidJS](https://solidjs.com/)
- **Runtime**: [Deno](https://deno.com/)
- **Map Library**: [Leaflet](https://leafletjs.com/) with Marker Clustering
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **API**: Service Victoria Fair Fuel Open Data API
- **Testing**: [Vitest](https://vitest.dev/) with Solid Testing Library (100+
  tests)

## 🚀 Getting Started

To run this application locally, you will need a **Service Victoria Fair Fuel
Open Data API Key** (`VIC_FUEL_CONSUMER_ID`).

1. **Configure Environment Variables**: Create a `.env` file in the root of the
   project (you can use `.env.example` as a template):
   ```env
   VIC_FUEL_CONSUMER_ID=your_api_key_here
   ```

2. **Run the Application**:
   ```bash
   # Install dependencies
   deno install

   # Run the development server
   deno task dev
   ```

The app will be available at `http://localhost:3000`.

## 🏗️ Building For Production

To build the application for production deployment:

```bash
deno task build
```

## 🧪 Testing

We maintain a comprehensive test suite (100+ tests) covering UI components,
business logic, and reactivity.

```bash
# Run all tests
deno task test

# Run tests with coverage
deno task test --coverage
```

## 📜 Documentation

- [User Stories](docs/user-stories.md):
  Detailed scenarios and functionality overview.

---

_Note: This project is built using modern web standards and high-performance
patterns. For more information, visit the
[TanStack documentation](https://tanstack.com)._
