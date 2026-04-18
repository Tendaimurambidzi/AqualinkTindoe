# Task: Fix "property 'paperTexture' doesnt exist" TypeScript error

## Plan Summary
- Define `paperTexture` properly typed as `ImageSourcePropType | null = null` in App.tsx.
- Update Image source props with type assertion to prevent TS error.
- No asset needed (keeps optional null-safe behavior).

## Steps
- [ ] 1. Add import for ImageSourcePropType to App.tsx
- [ ] 2. Declare const paperTexture: ImageSourcePropType | null = null;
- [ ] 3. Replace all Image source={paperTexture} with source={paperTexture as ImageSourcePropType | undefined}
- [ ] 4. Verify no TS errors and test app build

