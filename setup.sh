#!/usr/bin/env bash
set -e

echo ""
echo "==============================================="
echo "       JARVIS — Setup Script (Mac/Linux)       "
echo "==============================================="
echo ""

check_command() { command -v "$1" &>/dev/null; }

USE_DOCKER=false

if check_command docker && docker info &>/dev/null 2>&1; then
  echo "✅  Docker is running — using Docker mode."
  USE_DOCKER=true
else
  echo "⚠️   Docker not found or not running."
  OS="$(uname -s)"
  read -p "Try to install Docker? (y/n, default: n for Node.js fallback): " CHOICE
  if [ "$CHOICE" = "y" ]; then
    if [ "$OS" = "Darwin" ]; then
      if ! check_command brew; then
        echo "📦  Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
      fi
      echo "📦  Installing Docker Desktop via Homebrew..."
      brew install --cask docker 2>/dev/null || true
      echo "⚡  Docker Desktop installed. Open it from Applications, wait, then re-run."
    elif [ "$OS" = "Linux" ]; then
      echo "📦  Installing Docker via get.docker.com..."
      curl -fsSL https://get.docker.com | sh
      sudo usermod -aG docker "$USER" 2>/dev/null || true
      sudo systemctl start docker 2>/dev/null || true
      if docker info &>/dev/null 2>&1; then
        USE_DOCKER=true
        echo "✅  Docker is now running."
      else
        echo "⚠️   Docker installed but may need logout/login. Using Node.js for now."
      fi
    fi
  fi
  if [ "$USE_DOCKER" = false ]; then
    echo "Using Node.js fallback."
  fi
fi

# Ensure .env
if [ ! -f ".env" ]; then
  echo ""
  echo "📝  Creating .env from template..."
  cp .env.example .env
  echo "⚠️   IMPORTANT: Open .env and paste your API keys."
  echo "    Minimum required: GROQ_API_KEY (free at console.groq.com)"
  read -p "Press Enter once you've added keys to .env..."
fi

# Launch
if [ "$USE_DOCKER" = true ]; then
  echo "🐳  Starting JARVIS with Docker..."
  docker compose up -d --build
  echo "✅  JARVIS is running at http://localhost:3000"
  echo "📋  Logs: docker compose logs -f"
  echo "🛑  Stop: docker compose down"
else
  if ! check_command node; then
    echo "📦  Installing Node.js via nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 20 && nvm use 20
  fi
  echo "✅  Node.js: $(node -v)"
  echo "📦  Installing dependencies..."
  npm install --silent
  echo ""
  echo "🚀  Starting JARVIS at http://localhost:3000"
  echo "🛑  Press Ctrl+C to stop"
  npm run dev
fi
