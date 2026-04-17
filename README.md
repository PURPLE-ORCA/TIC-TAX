# TIC-TAX ⏳🩸

> A brutalist, survival-focused financial ledger a 20yo freelancers.

Most finance trackers are bloated SaaS wrappers built for salaried employees. They show you pie charts of your coffee habits but ignore the reality of freelance life: volatile income, silent SaaS subscriptions, and quarterly tax shakedowns.

**TIC-TAX** is an open-source mobile app designed to track your runway, quarantine your taxes, and aggressively remind you of your opportunity costs. 

No charts. No generic advice. Just the cold, hard numbers.

## Core Philosophy

* **The 3-Second Loop:** If logging a taxi ride takes more than three seconds, the UI failed. 
* **Time > Money:** Every expense is calculated in terms of "Days of Survival Lost."
* **Zero Phantom Capital:** Pending invoices do not inflate your usable balance.
* **Total Sovereignty:** Your data lives in your own Convex database, not a third-party server.

## Tech Stack

* **Framework:** [Expo](https://expo.dev/) / React Native
* **Backend & State:** [Convex](https://www.convex.dev/) (Real-time sync, local-first logic)
* **Styling:** [Uniwind](https://uniwind.dev/) (Tailwind for React Native)
* **UI Components:** [Gorhom Bottom Sheet](https://gorhom.github.io/react-native-bottom-sheet/), [HeroUI](https://heroui.com/) (Dialogs)
* **Package Manager:** [Bun](https://bun.sh/)

## Key Features

### 1. The Pulse (Real-Time Ledger)
Your daily reality check. Automatically intercepts every unit of income, slices off your exact tax bracket (configurable, defaults to 1%), and locks it in the **Tax Hostage** vault. You only ever see your actual `Safe to Spend` capital.

### 2. The Runway (Survival Clock)
Calculates your absolute fixed monthly costs ("Continious Bleed"). It takes your Safe Capital and divides it by your Burn Rate to give you a ruthless countdown: *Exactly how many months until you go broke if you stop working today.*

### 3. The Waiting Room (Accounts Receivable)
Invoices sent are not cash in hand. Log incoming money as `PENDING`. It mocks you from the dashboard until the client actually pays, ensuring you never forget to follow up, while keeping your active budget strictly accurate.

### 4. The Regret Sandbox (Opportunity Cost Simulator)
A client-side simulator. Before you buy a 300 MAD mechanical keyboard, add it to the sandbox. It instantly calculates how many days of runway that purchase will destroy, and exactly how much new gross income you need to invoice to recover the cost.

## Getting Started (Local Development)

You don't need to pay for cloud hosting to use this. You can run the entire backend locally.

**1. Clone the repository**
```bash
git clone https://github.com/PURPLE-ORCA/TIC-TAX.git
cd tic-tax
```

**2. Install dependencies (Bun recommended)**
```bash
bun install
```

**3. Start the Convex Backend**
This will start your local database on port `3210`.
```bash
bunx convex dev
```

**4. Run the Expo App**
In a new terminal window:
```bash
bun dev
```

## Contributing

This app was built for brutal efficiency. If you want to contribute, adhere to the following rules:
1.  **Keep it native and fast.** No heavy animation libraries if a simple transition will do.
2.  **No bloated state management.** Convex handles the data layer. We don't need Redux for a 3-screen app.
3.  **UI is secondary to UX.** If a new feature adds friction to the 3-second data entry loop, it gets rejected.

## License

MIT License. Do whatever you want with it, just don't blame me when the Survival Clock hits zero.