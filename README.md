# TIC-TAX v1.2.0 ⏳🩸

> A brutalist, offline-first financial ledger for freelancers who enjoy survival math more than corporate fluff.

TIC-TAX is a mobile app for tracking cash flow, quarantining taxes, managing recurring burn, and calculating how long you can keep pretending your “freelance lifestyle” is sustainable.

Version `1.2.0` is the big one:

- SQLite-first ledger with idempotent Convex sync
- Runway tab for recurring costs and survival clock
- Long-press deletion flows for transactions and subscriptions
- Tax Hostage reset flow for cleared taxes
- Android edge-to-edge and keyboard handling fixes

No charts for the sake of charts. No SaaS nonsense. Just the numbers that matter.

## Core Philosophy

- The 3-second loop matters. If logging takes longer, the UI failed.
- Time is the real currency. Every expense should tell you how much life it burns.
- Taxes are not “available balance.” Pending invoices are not cash. Reality wins.
- Your ledger should work offline first, then sync when the network stops being dramatic.
- JS-thread abuse is a crime. Keep the UI native, fast, and boring where it needs to be.


### Offline-First Ledger

- Transactions now live in local SQLite as the source of truth.
- Writes are optimistic locally, then synced to Convex with UUID-based idempotency.
- The app flushes pending syncs when the app foregrounds or the network comes back.
- Remote rows are pulled back into the local ledger so another device does not get to gaslight you.

### Runway Tab

- Added recurring subscriptions to model monthly burn.
- Added the Survival Clock to calculate runway in months.
- Critical runway state highlights the problem in red instead of politely suggesting it.

### Deletion and Tax Controls

- Long-press deletion is wired for transactions and subscriptions.
- Tax Hostage can be reset once taxes are marked as paid.
- No swipey nonsense, no accidental taps, no nonsense “are you sure?” theater beyond native alerts.

### Android Stability

- Edge-to-edge safe-area handling is fixed for modern Android.
- Android nav bar styling is configured natively.
- Bottom sheet inputs use `BottomSheetTextInput` so the keyboard behaves like it should have in the first place.

## Tech Stack

- [Expo](https://expo.dev/) / React Native 0.83
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Convex](https://www.convex.dev/) for backend, sync, and realtime data
- SQLite for offline local ledger storage
- [Uniwind](https://uniwind.dev/) for styling
- [HeroUI Native](https://heroui.com/) for UI primitives
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/) for motion
- [Bun](https://bun.sh/) as the package manager

## Key Features

### 1. The Pulse

Your main ledger. Tracks income, expenses, tax withholding, and the actual safe-to-spend balance. It is the app’s rude little accountant.

### 2. The Runway

Models recurring monthly burn and calculates how many months of survival you have left. It shows monthly burn, safe capital, and a survival clock that gets ugly when the math gets ugly.

### 3. The Waiting Room

Tracks pending income separately from real cash so invoices do not magically become spendable money just because you feel optimistic.

### 4. The Regret Sandbox

Lets you simulate a purchase before you do something expensive and stupid. It tells you how many days of survival the item costs and how much income you need to recover it.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/PURPLE-ORCA/TIC-TAX.git
cd tic-tax
```

### 2. Install dependencies

```bash
bun install
```

### 3. Start the app

```bash
bun run dev
```

If you want platform-specific runs:

```bash
bun run android
bun run ios
```

## Architecture Notes

- `SQLite` is the local source of truth.
- `Convex` handles sync, realtime updates, and cloud persistence.
- `expo-secure-store` is used for sensitive persistence.
- Expo Router owns navigation. No custom router circus.
- Bottom sheets, navigation bar handling, and safe-area insets are configured for modern Android behavior.

## Development Commands

```bash
bun run dev
bun run android
bun run ios
bun run lint
bun run lint:fix
bun run format
bun run format:check
bun run typecheck
```

## Contributing

Keep contributions aligned with the app’s actual job:

- Keep the ledger fast.
- Keep the sync logic deterministic.
- Keep UI friction low.
- Do not reintroduce state management theater or JS-thread animations just to feel productive.

## License

MIT License. Use it, fork it, break it, just do not blame the app when your runway hits zero.
