#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Running custom deployment script..."

# Set the webroot path
WEBROOT=/home/site/wwwroot

# Navigate to the repository root (where package.json is)
# SCM_SOURCE_PATH is the path where your code is cloned during deployment
cd "$SCM_SOURCE_PATH"

echo "Current Node version: $(node -v)"
if command -v nvm > /dev/null; then
    echo "Found nvm; switching to Node version as per .nvmrc..."
    nvm install && nvm use
    echo "Updated Node version: $(node -v)"
else
    echo "nvm not found; attempting to setup Node as per .nvmrc..."
    DESIRED_VERSION=$(cat .nvmrc | tr -d '[:space:]')
    DESIRED_NODE="v$DESIRED_VERSION"
    if [ "$(node -v 2>/dev/null)" != "$DESIRED_NODE" ]; then
        OS=$(uname -s | tr '[:upper:]' '[:lower:]')
        ARCH=$(uname -m)
        if [ "$ARCH" = "x86_64" ]; then ARCH="x64"; fi
        NODE_DISTRO="node-$DESIRED_NODE-$OS-$ARCH"
        if [ -d "$NODE_DISTRO" ]; then
            echo "Node.js $DESIRED_NODE already downloaded and extracted."
        else
            echo "Current Node version is $(node -v 2>/dev/null), required is $DESIRED_NODE. Downloading Node.js $DESIRED_NODE..."
            NODE_TARBALL="$NODE_DISTRO.tar.xz"
            wget "https://nodejs.org/dist/$DESIRED_NODE/$NODE_TARBALL" -O "$NODE_TARBALL"
            echo "Extracting $NODE_TARBALL..."
            if tar --help | grep -q '-J'; then
                echo "tar supports -xJf. Extracting..."
                tar -xJf "$NODE_TARBALL"
            else
                echo "tar does not support -xJf. Using unxz then tar extraction..."
                unxz "$NODE_TARBALL"
                tar -xf "${NODE_TARBALL%.xz}"
            fi
        fi
        export PATH="$(pwd)/$NODE_DISTRO/bin:$PATH"
        echo "Updated Node version: $(node -v)"
    else
        echo "Current Node version $(node -v) is as required."
    fi
fi

# install serve globally
echo "Installing serve globally..."
npm install -g serve

# Install dependencies
echo "Running npm install..."
npm install --legacy-peer-deps # Install dev dependencies for build

# Run the build
echo "Running npm run build..."
npm run build

# Clear the webroot directory
echo "Clearing existing webroot contents..."
rm -rf $WEBROOT/*

# Copy the contents of the build folder to the webroot
echo "Copying build output to webroot..."
cp -R build/* $WEBROOT/

# Copy package.json to webroot for npm scripts
echo "Copying package.json to webroot..."
cp package.json $WEBROOT/


# Optionally, handle specific static files like index.html if needed,
# though cp -R build/* should handle everything including dotfiles if present.
# cp build/index.html $WEBROOT/index.html


echo "Custom deployment script finished."

# Note: Kudu often sets up the web server (like Nginx/IIS) configuration
# after this script finishes, pointing it to the webroot directory.