# VSCode LSP MCP Server Troubleshooting

You have the ability to diagnose and fix issues with the VSCode LSP MCP server that provides language intelligence features.

## Architecture

This workspace uses a VSCode extension (`trademe.vscode-lsp-mcp`) that runs an MCP server:
- **Server**: Runs inside VSCode, exposes LSP capabilities via HTTP
- **Port File**: `.lsp_mcp.port` in workspace root contains the current port
- **MCP Proxy**: External proxy reads port file and forwards requests to VSCode
- **URL Handlers**: Custom VSCode URL scheme for controlling the server

## When to Use This Skill

Use when you encounter:
- MCP tools stop working or return errors
- Connection timeouts or server not responding
- Missing or outdated `.lsp_mcp.port` file
- User reports LSP features aren't working

## Available Commands

### Restart Server (Most Common)
```bash
# macOS/Linux
open "vscode://trademe.vscode-lsp-mcp/stop" && sleep 2 && open "vscode://trademe.vscode-lsp-mcp/start"

# Windows
start "vscode://trademe.vscode-lsp-mcp/stop" & timeout /t 2 & start "vscode://trademe.vscode-lsp-mcp/start"
```

### Start Server
```bash
# macOS/Linux
open "vscode://trademe.vscode-lsp-mcp/start"

# Windows
start "vscode://trademe.vscode-lsp-mcp/start"
```

### Stop Server
```bash
# macOS/Linux
open "vscode://trademe.vscode-lsp-mcp/stop"

# Windows
start "vscode://trademe.vscode-lsp-mcp/stop"
```

### Enable Autostart
```bash
# macOS/Linux
open "vscode://trademe.vscode-lsp-mcp/enableAutostart"

# Windows
start "vscode://trademe.vscode-lsp-mcp/enableAutostart"
```

## Diagnostic Steps

```bash
# Check if server is running
test -f .lsp_mcp.port && echo "✓ Running on port $(cat .lsp_mcp.port)" || echo "✗ Not running"

# Read port number
cat .lsp_mcp.port

# Test connection
curl http://localhost:$(cat .lsp_mcp.port)/
```

## Best Practices

1. Always use stop-wait-start for restarts (include sleep/timeout)
2. Wait 2-3 seconds after starting before testing
3. Inform the user when taking corrective actions
4. Check port file exists before assuming issues
5. Verify VSCode is running before using URL handlers
