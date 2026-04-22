#!/bin/bash

# Firebase deployment script for AqualinkTindoe project
# Project: aqualink-b5f7c

echo "Starting Firebase deployment for project: aqualink-b5f7c"

# Set Firebase project
firebase use aqualink-b5f7c

# Deploy Firebase functions
echo "Deploying Firebase functions..."
firebase deploy --only functions

# Deploy Firebase hosting (if configured)
echo "Deploying Firebase hosting..."
firebase deploy --only hosting

# Deploy Firestore rules
echo "Deploying Firestore rules..."
firebase deploy --only firestore:rules

# Deploy Storage rules
echo "Deploying Storage rules..."
firebase deploy --only storage:rules

echo "Firebase deployment completed for project: aqualink-b5f7c"
