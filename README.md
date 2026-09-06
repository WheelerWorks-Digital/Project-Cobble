# Cobble 🪨

> *Surface local issues. Rally your neighbors.*

A civic engagement mobile app built for **Drexel Hackathon 2026**. Cobble lets Philadelphia-area residents report neighborhood problems — potholes, broken infrastructure, community concerns — and gives local organizations a dashboard to monitor and respond. Civic participation is gamified through a sidequest system that rewards residents for staying engaged.

## What It Does

**As a Resident** you can post issues with photos and GPS location, upvote your neighbors' reports, track the status of open issues on a map, climb the leaderboard, and complete sidequests (e.g. *"Snap & Report a Pothole"*, *"Document 3 Infrastructure Issues"*).

**As an Organization** you get a monitoring dashboard to view open issues by neighborhood, see what residents are flagging, and track engagement across the community.

## Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.81 + Expo 54 |
| Language | TypeScript |
| Navigation | Expo Router (file-based) |
| Backend / DB | Supabase |
| Location | expo-location |
| Photos | expo-image-picker |
| Storage | AsyncStorage |
| Fonts | Inter, VT323, Press Start 2P |

## Project Structure

```
cobble/
├── app/
│   ├── index.tsx              # Landing screen (role selector)
│   ├── (resident)/            # Resident tab group
│   │   ├── feed.tsx           # Issue feed (trending / new / status)
│   │   ├── create.tsx         # Post a new issue
│   │   ├── map.tsx            # Map of nearby issues
│   │   ├── leaders.tsx        # Leaderboard
│   │   ├── sidequests.tsx     # Gamified civic tasks
│   │   └── profile.tsx        # User profile
│   └── (org)/                 # Organization tab group
│       ├── index.tsx          # Org dashboard
│       ├── map.tsx            # Neighborhood map
│       ├── leaders.tsx        # Engagement stats
│       └── profile.tsx        # Org profile
├── context/                   # AppContext (user role state)
├── constants/                 # Theme, types, mock data
├── lib/                       # Supabase client
└── assets/                    # Icons, splash, images
```

## How to Run

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Expo Go](https://expo.dev/go) installed on your phone (iOS or Android)
- Or an iOS/Android simulator on your machine

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Start the Expo development server
npx expo start
```

After running `npx expo start`, Expo will print a QR code in the terminal.

- **On your phone**: Open the Expo Go app and scan the QR code.
- **On Android emulator**: Press `a` in the terminal.
- **On iOS simulator**: Press `i` in the terminal.
- **In the browser**: Press `w` in the terminal.

### Environment

This project uses Supabase for its backend. If you're running it fresh, you'll need a `.env` file with your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

The app will fall back to mock data if no Supabase connection is present.

## Built With

- React Native + Expo
- TypeScript
- Expo Router (file-based navigation)
- Supabase (auth + database)
- expo-location & expo-image-picker
- expo-linear-gradient

---

*Built at Drexel Hackathon 2026 · A Wheeler Works project*
