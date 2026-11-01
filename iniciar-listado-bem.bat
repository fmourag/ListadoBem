@echo off
setlocal EnableExtensions
chcp 65001 >nul
title Listado Bem - Dependencias + App
cd /d "%~dp0"

set "CHECK="
set "NOBROWSER="
set "REINSTALL="

:args
if "%~1"=="" goto args_fim
if /i "%~1"=="--check" set "CHECK=1"
if /i "%~1"=="--no-browser" set "NOBROWSER=1"
if /i "%~1"=="--reinstall" set "REINSTALL=1"
if /i "%~1"=="--clean" set "CLEAN=1"
if /i "%~1"=="--restart" set "RESTART=1"
if /i "%~1"=="-h" goto ajuda
if /i "%~1"=="--help" goto ajuda
shift
goto args

:ajuda
echo.
echo Uso: iniciar-listado-bem.bat [opcoes]
echo.
echo   (sem opcoes)    instala dependencias se preciso e sobe o app em http://localhost:3001
echo   --check         so valida Node, npm, dependencias e .env.local; nao sobe o servidor
echo   --no-browser    sobe o servidor sem abrir o navegador
echo   --reinstall     forca "npm install" mesmo que as dependencias ja existam
echo   --clean         apaga .next antes de subir ^(corrige CSS/assets 404^)
echo   --restart       encerra um servidor antigo preso na porta 3001
echo.
exit /b 0

:args_fim
echo ============================================================
echo   Listado Bem - Rede de Apoio (Next.js)
echo ============================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado no PATH.
  echo Instale Node.js 20 ou superior: https://nodejs.org
  if not defined CHECK pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo [ERRO] npm nao encontrado no PATH.
  if not defined CHECK pause
  exit /b 1
)

for /f "delims=" %%v in ('node --version') do echo [ok] Node %%v
for /f "delims=" %%v in ('npm --version') do echo [ok] npm  %%v

set "PRECISA_INSTALAR="
if defined REINSTALL set "PRECISA_INSTALAR=1"
if not exist "node_modules\next\package.json" set "PRECISA_INSTALAR=1"

if defined PRECISA_INSTALAR (
  echo.
  echo [1/2] Instalando dependencias ^(npm install^)...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao instalar dependencias. Verifique sua conexao e tente de novo.
    if not defined CHECK pause
    exit /b 1
  )
  echo [ok] Dependencias instaladas.
) else (
  echo [ok] Dependencias ja instaladas.
)

if not exist ".env.local" (
  echo.
  echo [AVISO] .env.local nao encontrado.
  echo         A landing abre, mas listagem e cadastro vao reclamar de configuracao.
  echo            copy ".env.local.example" ".env.local"
  echo         e preencha NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.
) else (
  echo [ok] .env.local encontrado.
)

if defined CHECK (
  echo.
  echo [check] Tudo pronto. Rode sem --check para subir o app.
  exit /b 0
)

rem ------------------------------------------- .next incompativel (build x dev)
set "LIMPAR="
if defined CLEAN set "LIMPAR=1"
if exist ".next\BUILD_ID" set "LIMPAR=1"
if defined LIMPAR (
  echo.
  echo [i] Ajustando .next ^(build de producao nao serve para o modo dev^)...
  if exist ".next" rmdir /s /q ".next" 2>nul
  echo [ok] .next limpo.
)

if defined RESTART (
  echo.
  echo [i] Encerrando servidor antigo na porta 3001...
  powershell -NoProfile -Command "$c = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue; if ($c) { foreach ($procId in ($c.OwningProcess | Select-Object -Unique)) { $p = Get-CimInstance Win32_Process -Filter ('ProcessId = ' + $procId); if ($p -and $p.Name -eq 'node.exe' -and $p.CommandLine -match 'next') { Stop-Process -Id $procId -Force } } }" >nul 2>nul
  timeout /t 2 /nobreak >nul
)

powershell -NoProfile -Command "try{$c=New-Object Net.Sockets.TcpClient;$c.Connect('127.0.0.1',3001);$c.Close();exit 0}catch{exit 1}" >nul 2>nul
if not errorlevel 1 (
  echo.
  echo [AVISO] Ja existe um servidor na porta 3001.
  echo         Se a pagina estiver sem estilo ou com 404 em /_next, pode ser
  echo         um processo antigo. Feche a janela dele ou rode:
  echo            iniciar-listado-bem.bat --restart
  if not defined NOBROWSER start "" "http://localhost:3001"
  exit /b 0
)

if not defined NOBROWSER (
  start "" /b powershell -NoProfile -WindowStyle Hidden -Command "for($i=0;$i -lt 180;$i++){try{$c=New-Object Net.Sockets.TcpClient;$c.Connect('127.0.0.1',3001);$c.Close();Start-Process 'http://localhost:3001';break}catch{Start-Sleep -Milliseconds 500}}"
)

echo.
echo [2/2] Subindo Next.js em http://localhost:3001 ...
echo       O navegador abre sozinho quando o servidor responder.
echo       Pressione Ctrl+C para encerrar.
echo.

call npm run dev

echo.
echo Servidor encerrado. Codigo de saida: %errorlevel%
pause


