#!/bin/bash
# Ou se trouvent les 13 occurrences de [data-theme="rouge"] dans le HTML ?
grep -n 'data-theme="rouge"' /tmp/home-after-b3.html | head -15
