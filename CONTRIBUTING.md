# Contributing to SignedShot Documentation

Thank you for your interest in improving SignedShot documentation!

## Quick Start

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/signedshot-docs.git
   cd signedshot-docs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run start
   ```

4. Open `http://localhost:3000/docs/` in your browser

## Making Changes

### Documentation Files

All documentation is in the `docs/` directory as Markdown files:

```
docs/
├── intro.md              # Getting started guide
├── how-it-works.md       # Technical explanation
└── demo.md               # Demo walkthrough
```

### Writing Guidelines

- Use clear, concise language
- Include code examples where helpful
- Add screenshots for UI-related docs
- Test all code snippets before submitting

### Adding New Pages

1. Create a new `.md` file in `docs/`
2. Add frontmatter at the top:
   ```markdown
   ---
   sidebar_position: 4
   title: Your Page Title
   ---
   ```
3. Update `sidebars.ts` if needed

## Pull Request Guidelines

1. **Branch naming**: Use descriptive names
   - `docs/add-ios-guide`
   - `fix/typo-in-intro`

2. **Commit messages**: Be clear and concise
   - `docs: add Firebase App Check setup guide`
   - `fix: correct API endpoint in example`

3. **PR description**: Explain what you changed and why

4. **Preview**: Test your changes locally before submitting

## Building for Production

```bash
npm run build
```

Check that the build succeeds without errors.

## Questions?

Open an issue for questions or suggestions.
