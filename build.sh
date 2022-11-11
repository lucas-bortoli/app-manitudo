set -e

WORKSPACE="$1"
TARGET="/D/TCC"

echo "Workspace: " $WORKSPACE

cd "$WORKSPACE"

cp -rf ./* "$TARGET"

cd "$TARGET"

echo "Instalando..."

cordova build
adb install ./platforms/android/app/build/outputs/apk/debug/app-debug.apk