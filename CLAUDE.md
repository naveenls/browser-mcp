# Browser MCP

A browser automation MCP (Model Context Protocol) server that enables AI applications to control real browser tabs through a Chrome extension using a session-based architecture.

## 🎯 Project Goal

Build a browser automation MCP server that AI applications can use to:
- Enable control of real browser tabs through a Chrome extension
- Provide session-based architecture where each MCP instance controls a specific tab
- Allow AI agents to interact with web pages naturally through browser automation tools

## 🏗️ Architecture Overview

The project consists of three packages that work together to provide seamless browser automation:

```
MCP Client (AI App) → MCP Server → WebSocket → Extension Background → Content Script → Web Page
```

### Package Structure

```
browser-mcp/
├── packages/
│   ├── shared/          # Common types and tool definitions
│   ├── extension/       # Chrome extension for browser control
│   └── mcp-server/      # MCP server that AI clients connect to
├── package.json         # Root workspace configuration
└── pnpm-workspace.yaml  # PNPM workspace configuration
```

### Communication Flow

1. **MCP Client** connects to the MCP Server
2. **MCP Server** communicates with the Chrome extension via WebSocket
3. **Extension Background Script** maintains session routing and tab management
4. **Content Scripts** execute browser automation commands on web pages
5. **Results** flow back through the same chain to the AI application

## 🔧 How It Works

### Session-Based Routing

The system uses a session-based architecture to manage multiple browser tabs:

1. **User opens extension popup** on a browser tab and selects a session to connect
2. **MCP server instances** are identified by unique session names
3. **Background script** maintains a `tabId ↔ sessionName` mapping
4. **Commands are routed** to the correct tab based on the session identifier

### Session Management

- Each MCP server instance has a unique session name
- Users can connect/disconnect tabs to specific sessions via the extension popup
- Multiple sessions can run simultaneously, each controlling different tabs
- Session state is maintained across page navigations within the same tab

## 📦 Package Descriptions

### @browser-mcp/shared

**Purpose**: Common types, interfaces, and tool definitions shared across all packages.

**Key Components**:
- Tool definitions and type interfaces
- WebSocket message types and protocols
- Session management types
- Communication interfaces between MCP server and extension

### @browser-mcp/extension

**Purpose**: Chrome extension that provides browser control capabilities.

**Components**:
- **Background Script**: Manages WebSocket connections and session routing
- **Content Scripts**: Execute automation commands on web pages
- **Popup Interface**: Allows users to connect tabs to MCP sessions

**Permissions**:
- `tabs`: Access and manage browser tabs
- `activeTab`: Interact with the currently active tab
- `storage`: Store session configuration and state

### @browser-mcp/mcp-server

**Purpose**: MCP server implementation that AI clients connect to.

**Features**:
- Implements MCP protocol for AI client communication
- Manages WebSocket server for extension communication
- Provides browser automation tools as MCP resources
- Handles session-based command routing

## 🛠️ Available Tools

The following browser automation tools are defined (implementation in progress):

### Navigation Tools
- **`browser_navigate`**: Navigate to a URL and wait for page load
- **`browser_wait`**: Wait for elements to appear/disappear with timeout

### Interaction Tools
- **`browser_click`**: Click on elements using selectors, text, or coordinates
- **`browser_fill`**: Fill form inputs with text values
- **`browser_hover`**: Hover over elements to trigger hover states
- **`browser_key_press`**: Send keyboard input with modifier support

### Data Extraction Tools
- **`browser_extract`**: Extract text, attributes, or data from page elements
- **`browser_screenshot`**: Capture full page or element screenshots

### Page Manipulation Tools
- **`browser_scroll`**: Scroll page or specific elements in any direction

### Tool Input Options

Each tool supports flexible element targeting:
- **CSS Selectors**: `#id`, `.class`, `div[data-test="value"]`
- **XPath expressions**: `//div[@class="example"]`
- **Text content**: Find elements by visible text
- **Coordinates**: Direct x,y positioning for clicks

## 🚀 Development

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 10.13.1
- Chrome browser for extension testing

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd browser-mcp

# Install dependencies
pnpm install
```

### Development Commands

```bash
# Start development mode (watch mode for all packages)
pnpm dev

# Build all packages
pnpm build

# Type checking
pnpm typecheck

# Clean build artifacts
pnpm clean
```

### Package-Specific Commands

```bash
# Work on specific packages
cd packages/mcp-server
pnpm dev

cd packages/extension
pnpm build

cd packages/shared
pnpm typecheck
```

### Chrome Extension Development

1. **Build the extension**:
   ```bash
   cd packages/extension
   pnpm build
   ```

2. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `packages/extension` directory

3. **Test the extension**:
   - Open a webpage
   - Click the extension icon to open the popup
   - Connect the tab to an MCP session

### MCP Server Development

1. **Start the server**:
   ```bash
   cd packages/mcp-server
   pnpm build && pnpm start
   ```

2. **Connect an MCP client**:
   - Configure your AI application to connect to the MCP server
   - Use the defined browser automation tools
   - Test session-based tab control

### Testing the Integration

1. **Start the MCP server** with a specific session name
2. **Load the Chrome extension** and open it on a browser tab
3. **Connect the tab** to the MCP session via the popup
4. **Use MCP tools** from your AI application to control the browser
5. **Verify commands** are executed on the correct tab

## 🔮 Future Enhancements

- **Multi-browser support**: Firefox, Safari, Edge
- **Advanced element selection**: Smart selectors, visual targeting
- **Performance monitoring**: Page load metrics, timing data
- **Error recovery**: Automatic retry and fallback strategies
- **Session persistence**: Save and restore session state
- **Debugging tools**: Visual feedback and command tracing

## 📄 License

ISC License - see individual package.json files for details.

## 🤝 Contributing

This project is in active development. Contributions are welcome for:
- Tool implementations
- Extension UI improvements
- Documentation enhancements
- Testing and bug fixes

## 📞 Support

For questions, issues, or feature requests, please open an issue in the project repository.