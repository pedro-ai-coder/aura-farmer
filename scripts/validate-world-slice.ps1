# Windows PowerShell 5.1+ / PowerShell 7
# Runs the full Aura Farmer local validation without GitHub Actions.
# Report includes branch, exact HEAD SHA, dependency versions and command outputs.
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot
$transcriptStarted = $false
$success = $true
try {
  if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'git not found in PATH' }
  if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) { throw 'npm.cmd not found in PATH. Install Node.js 20.19+.' }
  $sha = (& git rev-parse HEAD).Trim()
  $branch = (& git branch --show-current).Trim()
  if ($LASTEXITCODE -ne 0) { throw 'Cannot read repository HEAD.' }
  $reports = Join-Path $repoRoot '.local-reports'
  New-Item -Path $reports -ItemType Directory -Force | Out-Null
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $report = Join-Path $reports ("world-slice-" + $stamp + "-" + $sha.Substring(0,12) + ".txt")
  Start-Transcript -Path $report -Force | Out-Null
  $transcriptStarted = $true
  Write-Host "Aura Farmer world-slice validation"
  Write-Host "Branch: $branch"
  Write-Host "HEAD: $sha"
  Write-Host "Started: $(Get-Date -Format o)"
  Write-Host "Node: $(& node --version)"
  Write-Host "npm: $(& npm.cmd --version)"
  $steps = @(
    @('ci'),
    @('run','typecheck'),
    @('test'),
    @('run','build'),
    @('run','test:browser')
  )
  foreach ($step in $steps) {
    $label = $step -join ' '
    Write-Host ""
    Write-Host "==== npm $label ===="
    & npm.cmd @step
    if ($LASTEXITCODE -ne 0) {
      $success = $false
      Write-Host "FAIL: npm $label (exit $LASTEXITCODE)"
      break
    }
    Write-Host "PASS: npm $label"
  }
  Write-Host "Finished: $(Get-Date -Format o)"
  Write-Host "RESULT: $(if ($success) { 'PASS' } else { 'FAIL' })"
  Write-Host "Report: $report"
} catch {
  $success = $false
  Write-Host "Validation failed: $_"
} finally {
  if ($transcriptStarted) { Stop-Transcript | Out-Null }
  Pop-Location
}
if (-not $success) { exit 1 }
