# 📚 Smart Notes Study Workspace

Modern, high-performance, and responsive study platform designed for day-mode reading across **Mobile Phones**, **Tablets**, and **Laptops/Desktops**.

---

## 🗂️ Clean Modular Project Structure

```text
Notes/
├── index.html            # Central Study Hub (Dashboard & Notebook Directory)
├── java.html             # ☕ Java Study Notes (41 comprehensive topics)
├── springboot.html       # 🌱 Spring Boot Study Notes (25 comprehensive topics in Hindi + English)
├── dsa.html              # 🧠 DSA Study Notes (Data Structures & Algorithms)
├── c.html                # ⚡ C Language Study Notes
├── cpp.html              # 🚀 C++ Language Study Notes
├── dbms.html             # 🗄️ DBMS Study Notes (Ready for topics)
├── cn.html               # 🌐 Computer Networks Study Notes (Ready for topics)
├── server.js             # Express.js local server with static routing
├── package.json          # Node dependencies (express, cors)
│
└── public/               # Modular static assets
    ├── css/
    │   ├── variables.css   # Color palette (Day Mode), typography & layout tokens
    │   ├── sidebar.css     # Hover-expandable rail (desktop) & off-canvas drawer (mobile)
    │   ├── components.css  # Cards, code snippets, copy buttons, simulators & callouts
    │   ├── responsive.css  # Mobile (≤640px), Tablet (641-1024px) & Desktop (>1024px) rules
    │   └── main.css        # Unified aggregator importing all CSS modules
    │
    └── js/
        ├── sidebar.js      # Hover peek expansion, pin toggle, mobile drawer & TOC scrollspy
        └── app.js          # Universal copy code, live search, responsive tables & note stats
```

---

## 🚀 Key Features

### 1. 🖱️ Smart Hover-Expandable Sidebar
- **Desktop (Laptops/PCs)**:
  - Default state: Sleek **70px icon rail** so the reading space is maximized.
  - **Auto-Open on Hover**: Hovering over the sidebar smoothly expands it to **310px**, revealing topic titles, outline, and section links.
  - **Auto-Close on Leave**: Moving the mouse back to notes smoothly collapses the sidebar back to 70px.
  - **Optional Pin (📌)**: Click the pin icon in the sidebar header to lock it open if desired.
- **Mobile & Tablet (Touch Devices)**:
  - Fully responsive slide-out drawer with a backdrop overlay.
  - Opened via the hamburger menu button (`☰`) in the top bar.
  - Automatically closes when selecting a topic link or tapping the backdrop.

### 2. 📱 100% Responsive Layout & Full Fluid Workspace
- **Phones (≤ 640px)**:
  - Compact header with search.
  - Interactive simulators stack vertically into single columns.
  - Automatic horizontal scroll wrappers on all tables (`.table-responsive`) so pages never stretch or break.
- **Tablets (641px – 1024px)**:
  - Optimized reading margins, touch-sized buttons, and off-canvas navigation.
- **Laptops & Desktops (> 1024px)**:
  - Full Area fluid width (`width: 100%; max-width: 100%`) for wide reading and multi-window multitasking.

### 3. ☀️ Day Mode Only
- Curated clean daylight color palette:
  - Background: `#f8fafc` (Slate 50)
  - Cards & Sidebar: `#ffffff`
  - Text: `#0f172a` (Slate 900)
  - Accent: `#4f46e5` (Indigo) / `#2563eb` (Blue) / `#7c3aed` (Purple) / `#0284c7` (Sky)
  - Code Editor: `#0f172a` dark syntax block for maximum legibility.

### 4. 📝 Rule for Adding New Notes
- **Never add date stamps** (e.g. `"Added on Oct 15, 2026"`).
- Add new topics inside `<div id="notebook-sections">` using `<article class="notes-section" id="...">`.
- The Table of Contents (TOC) and section count badge update automatically.

---

## 💻 Running Locally

```bash
# Install dependencies (if not already installed)
npm install

# Start local server
node server.js
```

Open in your browser:
- **Hub**: [http://localhost:3000/](http://localhost:3000/)
- **Spring Boot**: [http://localhost:3000/springboot](http://localhost:3000/springboot)
- **Java**: [http://localhost:3000/java](http://localhost:3000/java)
- **DSA**: [http://localhost:3000/dsa](http://localhost:3000/dsa)
- **C Language**: [http://localhost:3000/c](http://localhost:3000/c)
- **C++ Language**: [http://localhost:3000/cpp](http://localhost:3000/cpp)
- **DBMS**: [http://localhost:3000/dbms](http://localhost:3000/dbms)
- **CN**: [http://localhost:3000/cn](http://localhost:3000/cn)


# Notes
