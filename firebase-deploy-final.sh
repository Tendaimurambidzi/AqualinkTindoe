#!/bin/bash

# Firebase deployment command for AqualinkTindoe app
# Project ID: aqualink-b5f7c

echo "Deploying Firebase project: aqualink-b5f7c"

# Deploy Firebase functions
echo "Deploying Firebase functions..."
firebase deploy --only functions --project aqualink-b5f7c

# Deploy Firebase hosting
echo "Deploying Firebase hosting..."
firebase deploy --only hosting --project aqualink-b5f7c

# Deploy Firestore rules
echo "Deploying Firestore rules..."
firebase deploy --only firestore:rules --project aqualink-b5f7c

# Deploy Storage rules
echo "Deploying Storage rules..."
firebase deploy --only storage --project aqualink-b5f7c

# Deploy all Firebase services at once
echo "Deploying all Firebase services..."
firebase deploy --project aqualink-b5f7c

echo "Firebase deployment completed for project: aqualink-b5f7c"
