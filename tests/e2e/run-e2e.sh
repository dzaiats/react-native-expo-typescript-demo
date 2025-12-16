#!/bin/bash

# Script to run E2E tests with Metro bundler
# This ensures Metro is running before Detox tests start

METRO_PORT=8081
METRO_URL="http://localhost:${METRO_PORT}"

# Function to check if Metro is running
check_metro() {
  curl -s "$METRO_URL/status" > /dev/null 2>&1
  return $?
}

# Function to start Metro in background
start_metro() {
  echo "Starting Metro bundler..."
  npx expo start --no-dev --minify > /dev/null 2>&1 &
  METRO_PID=$!
  
  # Wait for Metro to be ready
  echo "Waiting for Metro bundler to be ready..."
  for i in {1..30}; do
    if check_metro; then
      echo "Metro bundler is ready"
      return 0
    fi
    sleep 1
  done
  
  echo "Error: Metro bundler failed to start"
  kill $METRO_PID 2>/dev/null
  return 1
}

# Check if Metro is already running
if check_metro; then
  echo "Metro bundler is already running"
else
  start_metro || exit 1
  TRAP_CMD="kill $METRO_PID 2>/dev/null"
  trap "$TRAP_CMD" EXIT
fi

# Run Detox tests
echo "Running Detox E2E tests..."
detox test --configuration ios.sim.debug --config-path .detoxrc.js

EXIT_CODE=$?

# Cleanup
if [ ! -z "$METRO_PID" ]; then
  kill $METRO_PID 2>/dev/null
fi

exit $EXIT_CODE

