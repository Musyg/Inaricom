#!/bin/bash
grep -oE '<a[^>]*custom-logo-link[^>]*>' /tmp/prod-full.html | head -1
echo ""
grep -oE 'custom-logo-link[^"]*' /tmp/prod-full.html | head -3
