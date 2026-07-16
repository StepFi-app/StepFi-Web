## Summary

Closes #[issue number]

Briefly describe what this PR does in 2-3 sentences.

## This repo is for the React web app only

This app targets sponsors, vendors, and mentors.
It does NOT serve learners. Learner features
belong in StepFi-App.

Before submitting, confirm your changes belong here:

- [ ] My changes are inside src/
- [ ] I have NOT added Rust, Soroban, or
      contract code
- [ ] I have NOT added React Native or
      Expo-specific code
- [ ] I have NOT hardcoded hex color values
      (use Tailwind classes or constants/colors.ts)
- [ ] All icons are from lucide-react only
- [ ] No API calls made directly in page files
      (use services/ layer only)

## Type of change

- [ ] Bug fix
- [ ] New page or component
- [ ] Service layer addition
- [ ] Styling or responsive fix
- [ ] Accessibility improvement
- [ ] Performance improvement

## Testing

- [ ] npm run build passes with zero errors
- [ ] npm run lint passes with zero errors
- [ ] Loading, error, and empty states handled
- [ ] Page tested on mobile viewport (375px)
- [ ] No console errors in browser

## Context files reviewed

- [ ] context/architecture-context.md
- [ ] context/code-standards.md
- [ ] context/progress-tracker.md updated

## Mandatory before requesting review

Running these must all exit 0:
npm run lint
npm test
npm run build

If either fails, fix it before opening this PR.
PRs that reduce the test count will be rejected.
PRs with failing CI will be closed without review.
