# SignedShot Documentation

Technical documentation for the SignedShot media authenticity protocol.

Built with [Docusaurus](https://docusaurus.io/).

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run start
```

The docs will be available at `http://localhost:3000/docs/`

### Build

```bash
npm run build
```

Generates static content in the `build/` directory.

## Documentation Structure

```
docs/
├── intro.md              # Getting started
├── how-it-works.md       # Two-layer trust model explanation
└── demo.md               # Interactive demo guide
```

## Deployment

Deployed automatically to [signedshot.io/docs](https://signedshot.io/docs) on push to main.

## Related Repositories

- [signedshot-api](https://github.com/SignedShot/signedshot-api) - Backend API
- [signedshot-ios](https://github.com/SignedShot/signedshot-ios) - iOS SDK
- [signedshot-validator](https://github.com/SignedShot/signedshot-validator) - Verification CLI/library

## License

MIT
