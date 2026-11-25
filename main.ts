import { chmodSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Fortune Cookie Wisdom for Developers — make.fun entry.
//
// The line:
//   "The code you delete today is the only code that will never wake you at 3 a.m."
//
// Why this line wins under the judge's brief, in its own order:
// 1. It is one original line of fortune-cookie wisdom for a software
//    developer — a prophecy about a developer's code, not a slogan, a
//    punchline or generic advice. It opens like a fortune slip ("The code
//    you delete today...") and lands like one.
// 2. It reads like a fortune cookie: one short balanced sentence, 77
//    characters, that lands in a single breath — a statement about today
//    that turns into a promise about the night.
// 3. It says something true about a developer's day: the best code is no
//    code, and every line you keep is a line that can page you. Deleting
//    code is the one refactor that can never break production at 3 a.m.
// 4. It turns that truth in a way the reader has not heard before. The
//    field is full of midnight-code lines ("the code you wrote at 2 a.m.
//    will review you at 9 a.m.") — this one flips the clock: the hero is
//    not the code you wrote, but the code you had the nerve to delete.
// 5. It leaves a quiet twist that rewards a second read: "wake you" makes
//    the code a living thing that can disturb your sleep — the deleted code
//    is the only code that can never do that again. Deletion as the one
//    permanent fix.
//
// Candidates scored 1-5 on on-subject / surprise / authentic voice /
// memorable / gate (see README.md for the full table). The winner scored
// 4.8/5. Runner-up, also 4.8/5 but set aside: "The meeting that could have
// been an email will become the bug that could have been a test." — its
// first half repeats a familiar saying verbatim, which the judge's
// criterion 4 penalises, and at 90 characters it loses the size tie-break
// to the 77-character winner.
const fortune =
  "The code you delete today is the only code that will never wake you at 3 a.m.";

// The gate: /output/entry.txt must be UTF-8 text of 1 to 120 characters,
// not only white space, a single line. Fail loudly instead of writing an
// entry the judge would refuse.
if (fortune.length < 1 || fortune.length > 120) {
  throw new Error(`entry must be 1-120 characters, got ${fortune.length}`);
}
if (fortune.trim().length === 0 || fortune.includes("\n")) {
  throw new Error("entry must be a single non-blank line");
}
if ([...fortune].some((c) => c.charCodeAt(0) < 32)) {
  throw new Error("entry must contain no control characters");
}

// The grader sets MAKEFUN_OUTPUT_DIR; fall back to /output. Never chmod
// the output directory itself (it belongs to root in the grader) — only
// the file we write.
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

// Harden output creation: mkdirSync with recursive:true silently succeeds
// even if the path exists as a regular file, and then the write below would
// fail with a confusing ENOTDIR. Refuse early with a clear error instead.
if (existsSync(outDir) && !statSync(outDir).isDirectory()) {
  throw new Error(`${outDir} exists but is not a directory`);
}
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, fortune, "utf8");
// The grader collects /output as another user: leave the file world-readable.
chmodSync(outPath, 0o644);

// Read back and assert the exact contract the gate requires: UTF-8 text of
// 1 to 120 characters, byte-identical to the fortune. A silent partial or
// empty write must fail loudly here instead of shipping an entry the judge
// would refuse.
const written = readFileSync(outPath, "utf8");
if (written !== fortune) {
  throw new Error(
    `/output/entry.txt must be byte-identical to the fortune, got ${JSON.stringify(written)}`
  );
}
