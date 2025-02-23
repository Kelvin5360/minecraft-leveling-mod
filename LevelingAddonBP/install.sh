#!/bin/bash

# Define Minecraft Bedrock behavior packs path on Mac
MC_PATH="$HOME/Library/Application Support/minecraftpe/games/com.mojang/development_behavior_packs"

# Define addon zip file
ADDON_ZIP="LevelingAddonBP.zip"

# Get the latest release download URL from GitHub
LATEST_RELEASE_URL=$(curl -s https://api.github.com/repos/Kelvin5360/minecraft-leveling-mod/releases/latest | grep "browser_download_url" | cut -d '"' -f 4)

# Check if we got a valid URL
if [[ -z "$LATEST_RELEASE_URL" ]]; then
  echo "Error: Failed to fetch the latest release URL"
  exit 1
fi

# Download the addon zip if not already present
echo "Downloading latest version of Leveling Addon..."
curl -L -o "$ADDON_ZIP" "$LATEST_RELEASE_URL"
if [ $? -ne 0 ]; then
  echo "Error: Failed to download $ADDON_ZIP"
  exit 1
fi

# Create behavior packs folder if it doesn't exist
mkdir -p "$MC_PATH"

# Extract the addon into the behavior packs folder
unzip -o "$ADDON_ZIP" -d "$MC_PATH"

echo "Leveling Addon installed successfully! Launch Minecraft to use it."

# Instructions for direct execution from GitHub
echo "\nTo install directly, run:"
echo "curl -sL https://raw.githubusercontent.com/Kelvin5360/minecraft-leveling-mod/master/LevelingAddonBP/install.sh | bash"
