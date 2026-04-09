# Backend Validation & Testing Script

## Quick Backend Test Commands

Use these commands to test each endpoint directly.

### 1. Health Check

```bash
curl http://localhost:4000/health
# Expected: {"ok":true}
```

### 2. Test Drift Share Link

```bash
curl -X POST http://localhost:4000/drift/share-link \
  -H "Content-Type: application/json" \
  -d '{"liveId":"test123","channel":"test-channel","title":"Test Drift"}'

# Expected: {"ok":true,"shareLink":"drift://join/test123?channel=test-channel","webLink":"https://drift.app/live/test123","message":"..."}
```

### 3. Test Drift Request

```bash
curl -X POST http://localhost:4000/drift/request \
  -H "Content-Type: application/json" \
  -d '{"liveId":"test123","fromUid":"user456","fromName":"TestUser"}'

# Expected: {"ok":true}
```

### 4. Test Block User

```bash
curl -X POST http://localhost:4000/block-user \
  -H "Content-Type: application/json" \
  -d '{"uid":"user123","targetUid":"user456"}'

# Expected: {"ok":true}
```

### 5. Test Mute User

```bash
curl -X POST http://localhost:4000/mute-user \
  -H "Content-Type: application/json" \
  -d '{"liveId":"test123","targetUid":"user456","duration":300}'

# Expected: {"ok":true,"mutedUntil":...timestamp...}
```

### 6. Test Viewer Count

```bash
# Join
curl -X POST http://localhost:4000/drift/viewer-join \
  -H "Content-Type: application/json" \
  -d '{"liveId":"test123"}'

# Get count
curl "http://localhost:4000/drift/viewer-count?liveId=test123"

# Expected: {"count":1}
```

### 7. Test Notice Board Registration

```bash
curl -X POST http://localhost:4000/notice-board/register \
  -H "Content-Type: application/json" \
  -d '{
    "orgName":"Test Organization",
    "orgType":"Public",
    "email":"test@example.com",
    "phone":"123456789",
    "bio":"Test bio"
  }'

# Expected: {"ok":true,"registrationId":"1","status":"pending_payment","message":"..."}
```

### 8. Test Get Zimbabwe Schools

```bash
curl http://localhost:4000/school/list-zimbabwe

# Expected: {"schools":["Prince Edward School","St Georges College",...]}
```

### 9. Test School Registration

```bash
curl -X POST http://localhost:4000/school/register \
  -H "Content-Type: application/json" \
  -d '{
    "schoolName":"Prince Edward School",
    "email":"school@example.com",
    "phone":"123456789",
    "address":"Harare, Zimbabwe",
    "principalName":"Test Principal"
  }'

# Expected: {"ok":true,"schoolId":"1","school":{...},"message":"School account created successfully!"}
```

### 10. Test Teacher Registration

```bash
# First register a school (see #9), then:
curl -X POST http://localhost:4000/teacher/register \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId":"1",
    "name":"Test Teacher",
    "email":"teacher@example.com",
    "subject":"Mathematics"
  }'

# Expected: {"ok":true,"teacherId":"1","teacher":{...},"message":"Teacher account created successfully!"}
```

### 11. Test Create Lesson

```bash
# After registering teacher:
curl -X POST http://localhost:4000/teacher/create-lesson \
  -H "Content-Type: application/json" \
  -d '{
    "teacherId":"1",
    "title":"Introduction to Algebra",
    "subject":"Mathematics",
    "description":"Basic algebra concepts",
    "scheduledTime":"2024-12-01T10:00:00Z"
  }'

# Expected: {"ok":true,"lessonId":"lesson_...","lesson":{...},"message":"Lesson created successfully!"}
```

### 12. Test Wave Download

```bash
curl -X POST http://localhost:4000/wave/download \
  -H "Content-Type: application/json" \
  -d '{
    "waveId":"wave123",
    "uid":"user123"
  }'

# Expected (without Firebase): {"ok":true,"stub":true,"downloadUrl":"...","message":"Download ready (Firebase not configured)"}
```

## Frontend Integration Tests

### Test Download Service

```typescript
import { downloadWave } from './src/services/downloadService';

// Add this to a test button in your app
const testDownload = async () => {
  const result = await downloadWave(
    'test-wave-123',
    'https://example.com/test-video.mp4',
    'test_wave.mp4'
  );
  console.log('Download result:', result);
};
```

### Test Moderation Service

```typescript
import { blockUser, getViewerCount } from './src/services/moderationService';

const testModeration = async () => {
  // Test block
  await blockUser('my-uid', 'target-uid');
  
  // Test viewer count
  const count = await getViewerCount('live-123');
  console.log('Viewer count:', count);
};
```

### Test School Service

```typescript
import { getZimbabweSchools, registerSchool } from './src/services/schoolService';

const testSchool = async () => {
  // Get schools list
  const schools = await getZimbabweSchools();
  console.log('Zimbabwe schools:', schools);
  
  // Register a school
  const result = await registerSchool({
    schoolName: 'Prince Edward School',
    email: 'test@school.com',
    phone: '123456',
    address: 'Harare',
    principalName: 'Test Principal'
  });
  console.log('Registration result:', result);
};
```

## Automated Test Script

Save this as `test-backend.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:4000"
PASSED=0
FAILED=0

echo "🧪 Testing Drift Backend Endpoints"
echo "=================================="

# Test 1: Health Check
echo -n "Testing /health ... "
RESPONSE=$(curl -s $BASE_URL/health)
if [[ $RESPONSE == *'"ok":true'* ]]; then
  echo "✅ PASSED"
  ((PASSED++))
else
  echo "❌ FAILED"
  ((FAILED++))
fi

# Test 2: Zimbabwe Schools
echo -n "Testing /school/list-zimbabwe ... "
RESPONSE=$(curl -s $BASE_URL/school/list-zimbabwe)
if [[ $RESPONSE == *'"schools"'* ]]; then
  echo "✅ PASSED"
  ((PASSED++))
else
  echo "❌ FAILED"
  ((FAILED++))
fi

# Test 3: Drift Share Link
echo -n "Testing /drift/share-link ... "
RESPONSE=$(curl -s -X POST $BASE_URL/drift/share-link \
  -H "Content-Type: application/json" \
  -d '{"liveId":"test123","channel":"test"}')
if [[ $RESPONSE == *'"shareLink"'* ]]; then
  echo "✅ PASSED"
  ((PASSED++))
else
  echo "❌ FAILED"
  ((FAILED++))
fi

# Test 4: Block User
echo -n "Testing /block-user ... "
RESPONSE=$(curl -s -X POST $BASE_URL/block-user \
  -H "Content-Type: application/json" \
  -d '{"uid":"user1","targetUid":"user2"}')
if [[ $RESPONSE == *'"ok":true'* ]]; then
  echo "✅ PASSED"
  ((PASSED++))
else
  echo "❌ FAILED"
  ((FAILED++))
fi

# Test 5: Viewer Join
echo -n "Testing /drift/viewer-join ... "
RESPONSE=$(curl -s -X POST $BASE_URL/drift/viewer-join \
  -H "Content-Type: application/json" \
  -d '{"liveId":"test123"}')
if [[ $RESPONSE == *'"ok":true'* ]]; then
  echo "✅ PASSED"
  ((PASSED++))
else
  echo "❌ FAILED"
  ((FAILED++))
fi

echo ""
echo "=================================="
echo "Results: $PASSED passed, $FAILED failed"
echo "=================================="

if [ $FAILED -eq 0 ]; then
  echo "🎉 All tests passed!"
  exit 0
else
  echo "⚠️  Some tests failed"
  exit 1
fi
```

Make it executable and run:
```bash
chmod +x test-backend.sh
./test-backend.sh
```

## Windows PowerShell Test Script

Save as `test-backend.ps1`:

```powershell
$BaseUrl = "http://localhost:4000"
$Passed = 0
$Failed = 0

Write-Host "🧪 Testing Drift Backend Endpoints" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "Testing /health ... " -NoNewline
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get
    if ($response.ok -eq $true) {
        Write-Host "✅ PASSED" -ForegroundColor Green
        $Passed++
    } else {
        Write-Host "❌ FAILED" -ForegroundColor Red
        $Failed++
    }
} catch {
    Write-Host "❌ FAILED" -ForegroundColor Red
    $Failed++
}

# Test 2: Zimbabwe Schools
Write-Host "Testing /school/list-zimbabwe ... " -NoNewline
try {
    $response = Invoke-RestMethod -Uri "$BaseUrl/school/list-zimbabwe" -Method Get
    if ($response.schools) {
        Write-Host "✅ PASSED" -ForegroundColor Green
        $Passed++
    } else {
        Write-Host "❌ FAILED" -ForegroundColor Red
        $Failed++
    }
} catch {
    Write-Host "❌ FAILED" -ForegroundColor Red
    $Failed++
}

# Test 3: Share Link
Write-Host "Testing /drift/share-link ... " -NoNewline
try {
    $body = @{
        liveId = "test123"
        channel = "test"
        title = "Test"
    } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BaseUrl/drift/share-link" -Method Post -Body $body -ContentType "application/json"
    if ($response.shareLink) {
        Write-Host "✅ PASSED" -ForegroundColor Green
        $Passed++
    } else {
        Write-Host "❌ FAILED" -ForegroundColor Red
        $Failed++
    }
} catch {
    Write-Host "❌ FAILED" -ForegroundColor Red
    $Failed++
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Results: $Passed passed, $Failed failed" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

if ($Failed -eq 0) {
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Some tests failed" -ForegroundColor Yellow
    exit 1
}
```

Run:
```powershell
.\test-backend.ps1
```

## Verification Checklist

### Backend Running
- [ ] Server starts on port 4000
- [ ] No error messages in console
- [ ] Health endpoint returns `{"ok":true}`

### Endpoints Working
- [ ] `/health` - Returns OK
- [ ] `/school/list-zimbabwe` - Returns schools array
- [ ] `/drift/share-link` - Returns share links
- [ ] `/drift/request` - Accepts requests
- [ ] `/block-user` - Blocks users
- [ ] `/mute-user` - Mutes users
- [ ] `/drift/viewer-join` - Increments count
- [ ] `/notice-board/register` - Registers orgs
- [ ] `/school/register` - Registers schools
- [ ] `/teacher/register` - Registers teachers
- [ ] `/teacher/create-lesson` - Creates lessons
- [ ] `/wave/download` - Prepares downloads

### Frontend Services
- [ ] `downloadService.ts` imports without errors
- [ ] `moderationService.ts` imports without errors
- [ ] `schoolService.ts` imports without errors
- [ ] Services can connect to backend
- [ ] liveConfig.ts has correct backend URL

### UI Components
- [ ] DraggableTextBox moves smoothly
- [ ] VideoTile shows at good size
- [ ] No crashes when using new services

## Common Issues

### Backend won't start
```bash
# Check if port 4000 is in use
lsof -i :4000  # Mac/Linux
netstat -ano | findstr :4000  # Windows

# Use different port
PORT=4001 npm start
```

### Frontend can't connect
```typescript
// Test connection manually
fetch('http://localhost:4000/health')
  .then(r => r.json())
  .then(d => console.log('Connected:', d))
  .catch(e => console.error('Connection failed:', e));
```

### Services not working
```typescript
// Check liveConfig
console.log(require('./liveConfig'));

// Verify BACKEND_BASE_URL is set
```

## Success Criteria

✅ All curl tests return expected responses
✅ Test script shows all tests passed
✅ Frontend services can call backend
✅ No console errors
✅ Features work as expected in app

---

**Run these tests after starting the backend to verify everything is working correctly!**
