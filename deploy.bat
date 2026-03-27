@echo off
echo 🚀 Iniciando despliegue de Cognify.V2...

:: 1. Limpiar versiones anteriores
if exist dist rd /s /q dist

:: 2. Construir el proyecto
echo 📦 Construyendo aplicacion (Vite)...
call npm run build

:: 3. Moverse a la carpeta de salida
cd dist

:: 4. Configurar Git local en la carpeta dist
git init
git add .
git commit -m "Despliegue automatico - Cognify.V2"

:: 5. Forzar el subido al repo de Juan
:: Reemplaza "Juanu79" si el nombre de usuario de Juan es distinto
echo 📤 Subiendo a GitHub Pages...
git push -f https://github.com/Juanu79/Cognify.V2.git master:gh-pages

echo ✅ ¡Despliegue completado con exito!
cd ..
pause
