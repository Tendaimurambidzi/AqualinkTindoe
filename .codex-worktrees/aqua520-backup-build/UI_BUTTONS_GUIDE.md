# UI Close/Save Buttons Implementation Guide

## Quick Reference: Where to Add Buttons

This guide shows exactly where to add Close and Save buttons throughout the Drift app.

## 1. MY SHORE Profile Screen

### Profile Picture Upload Modal

Search for: Profile picture selection / upload modal
Add after image selection:

```typescript
{/* Add at bottom of profile picture modal */}
<View style={{ flexDirection: 'row', gap: 12, marginTop: 16, paddingHorizontal: 24 }}>
  <Pressable 
    style={[styles.secondaryBtn, { flex: 1 }]} 
    onPress={() => {
      // Cancel action - close modal without saving
      setShowProfilePicModal(false);
      setSelectedImage(null);
    }}
  >
    <Text style={styles.secondaryBtnText}>Cancel</Text>
  </Pressable>
  <Pressable 
    style={[styles.primaryBtn, { flex: 1 }]} 
    onPress={async () => {
      // Save profile picture
      if (selectedImage) {
        await uploadProfilePicture(selectedImage);
      }
      setShowProfilePicModal(false);
    }}
  >
    <Text style={styles.primaryBtnText}>Save</Text>
  </Pressable>
</View>
```

### Username Edit Modal

Search for: Username input / edit
Add:

```typescript
{/* Add to username edit section */}
<TextInput 
  value={editedUsername}
  onChangeText={setEditedUsername}
  style={styles.input}
  placeholder="Enter username"
/>
<View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
  <Pressable 
    style={[styles.secondaryBtn, { flex: 1 }]} 
    onPress={() => {
      setEditedUsername(profileName); // Reset
      setShowUsernameEdit(false);
    }}
  >
    <Text style={styles.secondaryBtnText}>Cancel</Text>
  </Pressable>
  <Pressable 
    style={[styles.primaryBtn, { flex: 1 }]} 
    onPress={async () => {
      await saveUsername(editedUsername);
      setShowUsernameEdit(false);
    }}
  >
    <Text style={styles.primaryBtnText}>Save</Text>
  </Pressable>
</View>
```

### Bio Edit Modal

Search for: Bio edit / description input
Add:

```typescript
{/* Add to bio edit section */}
<TextInput 
  value={editedBio}
  onChangeText={setEditedBio}
  style={[styles.input, { height: 100 }]}
  multiline
  placeholder="Tell others about yourself"
/>
<View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
  <Pressable 
    style={[styles.secondaryBtn, { flex: 1 }]} 
    onPress={() => {
      setEditedBio(profileBio); // Reset
      setShowBioEdit(false);
    }}
  >
    <Text style={styles.secondaryBtnText}>Cancel</Text>
  </Pressable>
  <Pressable 
    style={[styles.primaryBtn, { flex: 1 }]} 
    onPress={async () => {
      await saveBio(editedBio);
      setShowBioEdit(false);
    }}
  >
    <Text style={styles.primaryBtnText}>Save</Text>
  </Pressable>
</View>
```

## 2. Wave Editor / Caption Input

Search for: Caption input or `setShowCaptionInput`

```typescript
{/* Caption Input Modal */}
<Modal visible={showCaptionInput} transparent>
  <View style={styles.modalRoot}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Add Caption</Text>
      <TextInput
        value={captionText}
        onChangeText={setCaptionText}
        style={styles.input}
        placeholder="Enter your caption"
        multiline
      />
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <Pressable 
          style={[styles.secondaryBtn, { flex: 1 }]} 
          onPress={() => {
            setCaptionText('');
            setShowCaptionInput(false);
          }}
        >
          <Text style={styles.secondaryBtnText}>Cancel</Text>
        </Pressable>
        <Pressable 
          style={[styles.primaryBtn, { flex: 1 }]} 
          onPress={() => {
            // Caption is already saved in state
            setShowCaptionInput(false);
          }}
        >
          <Text style={styles.primaryBtnText}>Done</Text>
        </Pressable>
      </View>
    </View>
  </View>
</Modal>
```

## 3. Audio Selection Modal

Search for: `showAudioModal` or Ocean Melodies

```typescript
{/* Audio Modal - Already has close button, verify it exists */}
<Modal visible={showAudioModal} transparent>
  <View style={styles.modalRoot}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Add Audio</Text>
      
      {/* Audio selection UI */}
      
      {/* Ensure buttons exist at bottom */}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <Pressable 
          style={[styles.secondaryBtn, { flex: 1 }]} 
          onPress={() => {
            setShowAudioModal(false);
            setAudioUrlInput('');
          }}
        >
          <Text style={styles.secondaryBtnText}>Cancel</Text>
        </Pressable>
        <Pressable 
          style={[styles.primaryBtn, { flex: 1 }]} 
          onPress={() => {
            // Attach selected audio
            attachSelectedAudio();
            setShowAudioModal(false);
          }}
        >
          <Text style={styles.primaryBtnText}>Attach</Text>
        </Pressable>
      </View>
    </View>
  </View>
</Modal>
```

## 4. Notice Board Modal

Search for: `showNotice` or NOTICE BOARD

The Notice Board modal already has a Close button at line 4109.
Verify the Submit button has proper state management:

```typescript
{/* Notice Board - Enhance submit button */}
<Pressable 
  style={[styles.primaryBtn, { marginTop: 16 }]}
  onPress={async () => {
    // Validate inputs
    if (!orgName || !email) {
      Alert.alert('Missing Info', 'Please fill required fields');
      return;
    }
    
    // Call backend
    const result = await registerNoticeBoard({
      orgName,
      orgType,
      email,
      phone,
      bio,
      uid: auth().currentUser?.uid
    });
    
    if (result.ok) {
      setShowNotice(false);
      // Clear form
      setOrgName('');
      setEmail('');
      // ... reset other fields
    }
  }}
>
  <Text style={styles.primaryBtnText}>Submit Registration</Text>
</Pressable>
```

## 5. School Mode

Search for: `showSchoolMode` or SCHOOL MODE

The School Mode modal has a Close button. Ensure individual actions have proper confirmation:

```typescript
{/* Example: School registration within School Mode */}
<Pressable 
  style={styles.logbookAction}
  onPress={() => {
    Alert.prompt(
      'Register School',
      'Enter school name',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Register', 
          onPress: async (schoolName) => {
            if (schoolName) {
              const result = await registerSchool({
                schoolName,
                email: userEmail,
                phone: '',
                address: '',
                principalName: '',
                uid: auth().currentUser?.uid
              });
              
              if (result.ok) {
                Alert.alert('Success', result.message);
              }
            }
          }
        }
      ],
      'plain-text'
    );
  }}
>
  <Text style={styles.logbookActionText}>Register My School</Text>
</Pressable>
```

## 6. Live Stream Setup Modal

Search for: Live stream start or `startLiveNow`

```typescript
{/* Before "Start Live" button, add cancel option */}
<View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
  <Pressable 
    style={[styles.secondaryBtn, { flex: 1 }]} 
    onPress={() => {
      setShowLive(false);
      // Reset live settings
    }}
  >
    <Text style={styles.secondaryBtnText}>Cancel</Text>
  </Pressable>
  <Pressable 
    style={[styles.primaryBtn, { flex: 1 }]} 
    onPress={startLiveNow}
    disabled={isStartingLive}
  >
    <Text style={styles.primaryBtnText}>
      {isStartingLive ? 'Starting...' : 'Start Live'}
    </Text>
  </Pressable>
</View>
```

## Style Definitions

Add these to your stylesheet if not already present:

```typescript
const styles = StyleSheet.create({
  // ... existing styles ...
  
  primaryBtn: {
    backgroundColor: '#00C2FF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryBtnText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelBtn: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  cancelText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
```

## Implementation Checklist

- [ ] Profile picture upload modal → Save + Cancel buttons
- [ ] Username edit → Save + Cancel buttons  
- [ ] Bio edit → Save + Cancel buttons
- [ ] Caption input → Done + Cancel buttons
- [ ] Audio selection → Attach + Cancel buttons
- [ ] Notice Board → Submit button works with backend
- [ ] School Mode → Actions have confirmation
- [ ] Live setup → Start + Cancel buttons
- [ ] All modals can be closed
- [ ] All forms save data properly
- [ ] Cancel buttons reset state
- [ ] Save buttons validate input

## Testing

For each modal/form:
1. Open the modal
2. Make changes
3. Click Cancel → Verify changes are discarded
4. Open again, make changes
5. Click Save → Verify changes are persisted
6. Verify close button (X) works
7. Verify Android back button works

## Notes

- Always reset form state on Cancel
- Always validate before Save
- Show loading state during save operations
- Display success/error messages
- Consider adding confirmation dialogs for destructive actions
