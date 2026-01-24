# SplashLine Landing Page

A modern, responsive landing page for the SplashLine mobile app - connecting people through ocean adventures.

## Features

- **Direct APK Download**: Users can download the Android APK directly from the website
- **Responsive Design**: Optimized for all devices and screen sizes
- **Modern UI**: Clean, ocean-themed design with smooth animations
- **Installation Guide**: Step-by-step instructions for installing the APK
- **Feature Showcase**: Highlights key app features and capabilities

## File Structure

```
splashline-landing/
├── index.html          # Main landing page
├── styles.css          # Styling and responsive design
├── script.js           # Interactive functionality
├── splashline.apk      # Android app (add this file)
├── README.md           # This file
├── package.json        # Project metadata
├── deploy.sh           # Deployment script
└── PLACE_APK_HERE.txt  # Instructions for APK placement
```

## Setup Instructions

### 1. Add Your APK File

Replace `PLACE_APK_HERE.txt` with your actual APK file named `splashline.apk`:

```bash
# Copy your APK file to this directory
cp /path/to/your/app-release.apk ./splashline.apk
```

### 2. Local Testing

Test the landing page locally:

```bash
# Navigate to the landing page directory
cd splashline-landing

# Start a local server
python -m http.server 8000

# Open http://localhost:8000 in your browser
```

### 3. Deployment

#### Option A: Netlify (Recommended)

1. Push this code to GitHub
2. Connect your GitHub repo to Netlify
3. Set the build command to: (leave empty)
4. Set the publish directory to: `splashline-landing`
5. Deploy!

#### Option B: Manual Upload

Upload all files in this directory to any web hosting service.

## APK Hosting Notes

- **File Size Limit**: GitHub has a 100MB file size limit. For larger APKs:
  - Use Git LFS (Large File Storage)
  - Host the APK on a separate file hosting service
  - Update the download link in `index.html` and `script.js`

- **Security**: Ensure your APK is signed and from a trusted source

## Customization

### Colors and Branding

Edit `styles.css` to customize:
- Primary colors: `--primary-color`, `--secondary-color`, `--accent-color`
- Typography: Font family and sizes
- Ocean theme: Wave animations and gradients

### Content

Edit `index.html` to update:
- App name and tagline
- Feature descriptions
- Installation instructions
- Footer links

### Functionality

Edit `script.js` to modify:
- Download behavior
- Animations and interactions
- Notification messages

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

This landing page is part of the SplashLine project.