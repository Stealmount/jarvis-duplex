# JARVIS Setup Script for Windows
# Run with: PowerShell -ExecutionPolicy Bypass -File setup.ps1

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "          JARVIS - Setup Script (Windows)       " -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

function Test-Command($cmd) {
    return [bool](Get-Command $cmd -ErrorAction SilentlyContinue)
}

function Test-DockerRunning {
    try { $null = docker info 2>&1; return $LASTEXITCODE -eq 0 } catch { return $false }
}

function Install-DockerDesktop {
    Write-Host "Attempting to install Docker Desktop..." -ForegroundColor Yellow

    # Method 1: winget
    if (Test-Command "winget") {
        Write-Host "Trying winget install..." -ForegroundColor Yellow
        try {
            winget install -e --id Docker.DockerDesktop --accept-source-agreements --accept-package-agreements 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Docker Desktop installed via winget!" -ForegroundColor Green
                Write-Host "Please start Docker Desktop from Start Menu, wait until ready, then re-run this script." -ForegroundColor Yellow
                return $true
            }
        } catch {}
    }

    # Method 2: Chocolatey
    if (Test-Command "choco") {
        Write-Host "Trying Chocolatey install..." -ForegroundColor Yellow
        try {
            choco install docker-desktop -y 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Docker Desktop installed via Chocolatey!" -ForegroundColor Green
                Write-Host "Please start Docker Desktop, wait until ready, then re-run this script." -ForegroundColor Yellow
                return $true
            }
        } catch {}
    }

    # Method 3: Direct download
    Write-Host "Downloading Docker Desktop installer directly (~550MB)..." -ForegroundColor Yellow
    $installer = "$env:TEMP\DockerDesktopInstaller.exe"
    try {
        $ProgressPreference = 'SilentlyContinue'
        Invoke-WebRequest -Uri "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe" -OutFile $installer -UseBasicParsing
        Write-Host "Running installer (follow the prompts)..." -ForegroundColor Yellow
        Start-Process -FilePath $installer -ArgumentList "install","--quiet" -Wait
        Write-Host "Docker Desktop installer completed." -ForegroundColor Green
        Write-Host "Please start Docker Desktop from Start Menu, wait until ready, then re-run this script." -ForegroundColor Yellow
        return $true
    } catch {
        Write-Host "Docker download/install failed: $_" -ForegroundColor Red
        return $false
    }
}

# ── Step 1: Try Docker ────────────────────────────────────────
$useDocker = $false

if ((Test-Command "docker") -and (Test-DockerRunning)) {
    Write-Host "[OK] Docker is running - using Docker mode." -ForegroundColor Green
    $useDocker = $true
} else {
    Write-Host "[!] Docker not found or not running." -ForegroundColor Yellow

    $choice = Read-Host "Try to install Docker? (y/n, default: n for Node.js fallback)"
    if ($choice -eq 'y') {
        $installed = Install-DockerDesktop
        if ($installed) {
            Write-Host ""
            Write-Host "After starting Docker Desktop, run this script again." -ForegroundColor Cyan
            Write-Host "For now, continuing with Node.js..." -ForegroundColor Yellow
        }
    }
    Write-Host "Using Node.js fallback." -ForegroundColor Green
}

# ── Step 2: Ensure .env exists ────────────────────────────────
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "Creating .env from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host ""
    Write-Host "IMPORTANT: Open .env and add your API keys!" -ForegroundColor Red
    Write-Host "Minimum required: GROQ_API_KEY (free at console.groq.com)" -ForegroundColor White
    Write-Host ""
    Start-Process "notepad.exe" ".env"
    Read-Host "Press Enter after you have saved your .env file"
}

# ── Step 3: Launch ────────────────────────────────────────────
if ($useDocker) {
    Write-Host ""
    Write-Host "Starting JARVIS with Docker..." -ForegroundColor Cyan
    docker compose up -d --build
    Write-Host ""
    Write-Host "[OK] JARVIS is running!" -ForegroundColor Green
    Write-Host "Open http://localhost:3000 in Chrome" -ForegroundColor Cyan
    Write-Host "Logs: docker compose logs -f" -ForegroundColor White
    Write-Host "Stop: docker compose down" -ForegroundColor White
    try { Start-Process "http://localhost:3000" } catch {}
} else {
    Write-Host ""
    Write-Host "Setting up Node.js..." -ForegroundColor Green

    if (-not (Test-Command "node")) {
        Write-Host "Node.js not found. Installing..." -ForegroundColor Yellow
        if (Test-Command "winget") {
            winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
            $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
        } else {
            Write-Host "Please install Node.js from https://nodejs.org/en/download" -ForegroundColor Red
            Start-Process "https://nodejs.org/en/download"
            exit 1
        }
    }
    Write-Host "[OK] Node.js: $(node -v)" -ForegroundColor Green

    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install --silent 2>$null

    Write-Host ""
    Write-Host "Starting JARVIS companion (Next.js)..." -ForegroundColor Cyan
    Write-Host "Open http://localhost:3000 in Chrome" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop" -ForegroundColor White
    Write-Host ""
    npm run dev
}
