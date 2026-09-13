// In-app feedback channel. Point it at your own board (GitHub Issues, a TXC page, etc.)
// by setting NEXT_PUBLIC_FEEDBACK_URL in .env.local; defaults to this project's GitHub Issues.
// Only the feedback text a user explicitly submits leaves the machine — growth data never does.
export const FEEDBACK_URL =
  process.env.NEXT_PUBLIC_FEEDBACK_URL || 'https://github.com/AQ-zero/mission-seek-harness/issues';
export const FEEDBACK_CONFIGURED = !!FEEDBACK_URL;
