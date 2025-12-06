#!/bin/bash

# Convert Scholar 2.6 to Safari Web Extension
# Note: This script assumes you are on a Mac with Xcode installed.
# If you are on Linux/Windows, this is just a guide.

echo "Building project..."
npm run build

echo "Creating Safari Web Extension..."
# xcrun safari-web-extension-converter dist --project-location ./safari-build --app-name "Scholar 2.6" --bundle-identifier "com.yourname.scholar26"

echo "Done! Open the Xcode project in ./safari-build to run on Safari."
echo "Note: You may need to enable 'Develop > Allow Unsigned Extensions' in Safari."
