#!/bin/bash

echo "🔍 Checking current Firestore collections and documents..."

# Set the Firebase project
firebase use turn2cash-project

echo ""
echo "📋 Firestore Database Structure:"
echo "================================"

# Let's check for common collection names we might have
collections=("leads" "brands" "devices" "pricing" "iPhone13" "iPhone14" "Galaxy" "Pixel")

for collection in "${collections[@]}"; do
  echo ""
  echo "🗂️  Collection: $collection"
  echo "   Documents:"
  
  # Try to list documents in each collection (this will show if collection exists)
  firebase firestore:get $collection 2>/dev/null | head -20 || echo "   (Collection not found or empty)"
done

echo ""
echo "✅ Structure check completed!"