#!/bin/bash

CERT_NAME="MyDevCert"

echo "🔐 Creating a self-signed code signing certificate: $CERT_NAME"

# Generate a certificate and private key
openssl req \
  -newkey rsa:2048 \
  -nodes \
  -keyout "$CERT_NAME.key" \
  -x509 \
  -days 3650 \
  -out "$CERT_NAME.crt" \
  -subj "/CN=$CERT_NAME"

# Convert to PKCS12 format (.p12)
openssl pkcs12 \
  -export \
  -out "$CERT_NAME.p12" \
  -inkey "$CERT_NAME.key" \
  -in "$CERT_NAME.crt" \
  -password pass:

# Import into the login keychain (will prompt for user password)
security import "$CERT_NAME.p12" \
  -k ~/Library/Keychains/login.keychain-db \
  -P "" \
  -T /usr/bin/codesign

echo "✅ Imported '$CERT_NAME' into login keychain"

# Allow codesign to use the cert
security set-key-partition-list -S apple-tool:,apple: -s -k "" ~/Library/Keychains/login.keychain-db

# Clean up intermediate files (optional)
rm "$CERT_NAME.key" "$CERT_NAME.crt" "$CERT_NAME.p12"

echo "✅ Certificate is ready and usable via: codesign -s \"$CERT_NAME\""
