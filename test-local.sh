#!/bin/bash

# Test script for local development
# Usage: ./test-local.sh

BASE_URL="http://localhost:3000"
AUTH_TOKEN="claw0x_bridge_2026"

echo "🧪 Testing Claw0x Skills Locally"
echo "================================"
echo ""

# Test 1: Sentiment Analyzer
echo "1️⃣ Testing Sentiment Analyzer..."
curl -X POST "$BASE_URL/api/sentiment" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "I love this amazing product!"}' \
  -s | jq '.'
echo ""

# Test 2: Email Validator
echo "2️⃣ Testing Email Validator..."
curl -X POST "$BASE_URL/api/validate-email" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}' \
  -s | jq '.'
echo ""

# Test 3: Web Scraper
echo "3️⃣ Testing Web Scraper..."
curl -X POST "$BASE_URL/api/scrape" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' \
  -s | jq '.'
echo ""

# Test 4: Translation API
echo "4️⃣ Testing Translation API..."
curl -X POST "$BASE_URL/api/translate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "hello", "target_lang": "es"}' \
  -s | jq '.'
echo ""

# Test 5: Image Generator
echo "5️⃣ Testing Image Generator..."
curl -X POST "$BASE_URL/api/generate-image" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful sunset"}' \
  -s | jq '.'
echo ""

echo "✅ All tests completed!"
