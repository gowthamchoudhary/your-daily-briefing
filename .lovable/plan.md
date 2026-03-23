

## Personal AI News Companion

### Pages & Flow

**1. Onboarding Page (`/`)**
- User enters a name for their companion
- Selects one of 5 voices (Rachel, Adam, Bella, Antoni, Elli) with play preview buttons
- "Meet {name}" button proceeds to chat

**2. Chat Page (`/chat`)**
- Full-screen conversational UI with:
  - Large animated orb/pulse visual that reacts to speaking state (companion speaking vs listening)
  - Companion name displayed prominently
  - Microphone button to start/stop conversation
  - Live transcript showing what user said and companion's response
  - News cards grid that appears when `show_cards` client tool is triggered — cards show title, source, description, link
  - Social reaction cards styled differently (Twitter/Reddit style) when social search results come in
- Status indicator: connecting, connected, speaking, listening

### Design
- Dark theme, minimal, premium feel
- Animated gradient orb as the visual centerpiece (pulses when speaking)
- Cards slide in from bottom with smooth animations
- Glass-morphism card style
- Clean sans-serif typography

### Backend (Lovable Cloud Edge Functions)

**1. `elevenlabs-signed-url`** — Returns a signed WebSocket URL for the ElevenLabs agent session. Keeps API key server-side.

**2. `search-web`** — Webhook endpoint called by the ElevenLabs agent's `search_web` tool. Receives query, calls Firecrawl Search API, returns formatted results as text for the agent to speak.

### Frontend Architecture
- `useConversation` hook from `@elevenlabs/react` for WebSocket connection
- `show_cards` registered as a client tool — when agent calls it, cards render on screen
- Conversation overrides set dynamically: voice ID based on user selection, first message with companion name
- State stored in localStorage (companion name, selected voice)

### Connectors Needed
- **ElevenLabs** — for API key (signed URL generation)
- **Firecrawl** — for search API calls from edge function

