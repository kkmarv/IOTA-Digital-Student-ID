$keeperPath = "./keeper/backend"
$frontendPath = "./keeper/web"
$authorityPath = "./authority/backend"

$npmCommand = "npm run dev"

# Change directory to the script directory
$scriptPath = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
Set-Location -Path $scriptPath

# Enable node environment
& "./.node/Scripts/Activate.ps1"

# Start dev servers
Start-Process powershell.exe -WorkingDirectory $keeperPath -ArgumentList $npmCommand
Start-Process powershell.exe -WorkingDirectory $authorityPath -ArgumentList $npmCommand
Start-Process powershell.exe -WorkingDirectory $frontendPath -ArgumentList $npmCommand
