@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

rem Republica a versao atual na Vercel via Git (push em main) e valida o deploy.
rem Uso:
rem   republicar-listado-bem.bat            publica o commit atual
rem   republicar-listado-bem.bat --check    apenas mostra a versao online
rem   republicar-listado-bem.bat --no-smoke publica sem rodar o smoke test
rem   republicar-listado-bem.bat --help     ajuda

if /i "%~1"=="--help" goto ajuda

if not defined PROD_URL set "PROD_URL=https://listado-bem.vercel.app"
if not defined MAX_TENTATIVAS set "MAX_TENTATIVAS=30"
set "NO_SMOKE="
if /i "%~1"=="--no-smoke" set "NO_SMOKE=1"

where git >nul 2>&1
if errorlevel 1 (
  echo [ERRO] git nao encontrado no PATH.
  exit /b 1
)
where node >nul 2>&1
if errorlevel 1 (
  echo [ERRO] node nao encontrado no PATH.
  exit /b 1
)
where powershell >nul 2>&1
if errorlevel 1 (
  echo [ERRO] powershell nao encontrado no PATH.
  exit /b 1
)

git rev-parse --is-inside-work-tree >nul 2>&1
if errorlevel 1 (
  echo [ERRO] execute este arquivo dentro do repositorio.
  exit /b 1
)

for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set "BRANCH=%%b"
if /i not "!BRANCH!"=="main" (
  echo [ERRO] branch atual: !BRANCH!. Use a branch main.
  exit /b 1
)

set "LIVE="
call :versao
echo Producao: %PROD_URL%
echo Versao online: !LIVE!

if /i "%~1"=="--check" (
  if "!LIVE!"=="" (
    echo [ERRO] /api/version indisponivel.
    exit /b 1
  )
  echo [OK] versao consultada.
  exit /b 0
)

for /f "delims=" %%s in ('git status --porcelain') do (
  echo [ERRO] arvore de trabalho suja. Commit ou stash antes de republicar:
  git status --short
  exit /b 1
)

echo Sincronizando com origin/main...
git fetch origin main --quiet
if errorlevel 1 (
  echo [ERRO] falha no git fetch.
  exit /b 1
)

for /f "tokens=1,2" %%a in ('git rev-list --left-right --count origin/main...HEAD') do (
  set "BEHIND=%%a"
  set "AHEAD=%%b"
)
if not "!BEHIND!"=="0" (
  echo [ERRO] branch atras de origin/main. Rode git pull antes.
  exit /b 1
)

for /f "delims=" %%h in ('git rev-parse HEAD') do set "TARGET=%%h"
set "SHORT=!TARGET:~0,7!"

if /i "!LIVE!"=="!TARGET!" (
  echo A versao !SHORT! ja esta online; criando commit vazio para forcar novo deploy...
  git commit --allow-empty -m "chore: republica !SHORT!" >nul
  if errorlevel 1 (
    echo [ERRO] falha ao criar commit de republicacao.
    exit /b 1
  )
  for /f "delims=" %%h in ('git rev-parse HEAD') do set "TARGET=%%h"
  set "SHORT=!TARGET:~0,7!"
)

echo Enviando !SHORT! para origin/main...
git push origin main
if errorlevel 1 (
  echo [ERRO] falha no git push.
  exit /b 1
)

echo Aguardando deploy de !SHORT! (ate %MAX_TENTATIVAS% tentativas)...
set /a TENT=0
:aguardar
set /a TENT+=1
call :versao
if /i "!LIVE!"=="!TARGET!" goto publicado
if !TENT! GEQ %MAX_TENTATIVAS% (
  echo [ERRO] timeout aguardando deploy. Veja https://vercel.com/fmourag/listado-bem/deployments
  exit /b 1
)
timeout /t 10 /nobreak >nul 2>&1
if errorlevel 1 powershell -NoProfile -Command "Start-Sleep -Seconds 10" >nul
goto aguardar

:publicado
echo.
echo [OK] versao !SHORT! publicada em %PROD_URL%

if defined NO_SMOKE (
  echo Smoke test ignorado ^(--no-smoke^).
  exit /b 0
)

echo Rodando smoke test...
node tools\smoke-deploy.cjs %PROD_URL%
if errorlevel 1 (
  echo [ERRO] smoke test falhou.
  exit /b 1
)

echo.
echo [OK] republicacao concluida.
exit /b 0

:versao
set "LIVE="
for /f "usebackq delims=" %%v in (`powershell -NoProfile -ExecutionPolicy Bypass -Command "try { (Invoke-RestMethod -Uri '!PROD_URL!/api/version' -TimeoutSec 10).commit } catch { '' }"`) do set "LIVE=%%v"
exit /b 0

:ajuda
echo.
echo Republica a versao atual do Lista do Bem na Vercel.
echo.
echo   republicar-listado-bem.bat             publica o commit atual
echo   republicar-listado-bem.bat --check     apenas mostra a versao online
echo   republicar-listado-bem.bat --no-smoke  publica sem smoke test
echo.
echo Variaveis opcionais:
echo   PROD_URL          URL de producao (padrao: https://listado-bem.vercel.app)
echo   MAX_TENTATIVAS    tentativas de 10s aguardando o deploy (padrao: 30)
echo.
exit /b 0
