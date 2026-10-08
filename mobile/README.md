# OmniNexus Mobile

Native Android/iOS companion app for the OmniNexus career intelligence platform.

## Development
cd mobile
npm install
npx expo start

The app uses the existing FastAPI backend. Override the API with EXPO_PUBLIC_API_URL for local development.

## Android APK
From mobile:
npx eas build --platform android --profile preview

The preview profile produces an APK. Upload the resulting artifact to a GitHub Release using the asset name OmniNexus.apk. The website download CTA already targets that stable asset URL.
