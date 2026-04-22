#!/bin/bash

# Firebase deployment for AqualinkTindoe project
# Project: aqualink-b5f7c

echo "Deploying to Firebase project: aqualink-b5f7c"

# Set Firebase project
firebase use aqualink-b5f7c

# Deploy all components
firebase deploy --only functions,firestore:rules,storage:rules,hosting

echo "Deployment completed for project: aqualink-b5f7c"
