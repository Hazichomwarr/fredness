# gitConflict.md

# Git Merge Conflicts Cheat Sheet

## Mental Model

When merging:

```bash
git checkout main
git merge master
```

Git sees:

- **ours** = current branch (`main`)
- **theirs** = incoming branch (`master`)

Remember:

```txt
You are standing on OURS.
You are receiving THEIRS.
```

---

## Inspect Branches

See local branches:

```bash
git branch
```

See all branches including remote:

```bash
git branch -a
```

See current branch:

```bash
git status
```

---

## Fetch Remote Branches

```bash
git fetch origin
```

---

## Create Local Branch From Remote

If GitHub has a branch that doesn't exist locally:

```bash
git checkout -b main origin/main
```

or

```bash
git switch -c main origin/main
```

---

## Merge Branches

Merge master into main:

```bash
git checkout main
git merge master
```

---

## Unrelated Histories

If Git says:

```txt
fatal: refusing to merge unrelated histories
```

Allow it:

```bash
git merge master --allow-unrelated-histories
```

---

## Conflict Markers

Git inserts markers like:

```txt
<<<<<<< HEAD
main version
=======
master version
>>>>>>> master
```

Meaning:

```txt
HEAD = current branch (ours)
master = incoming branch (theirs)
```

---

## Accept All Incoming Changes

When master contains the work you want:

```bash
git checkout --theirs .
```

Then:

```bash
git add .
git commit -m "merge master into main"
```

---

## Accept All Current Changes

Keep current branch version:

```bash
git checkout --ours .
```

Then:

```bash
git add .
git commit -m "keep current branch"
```

---

## Abort Merge

If everything goes wrong:

```bash
git merge --abort
```

Git returns to pre-merge state.

---

## See Conflicted Files

```bash
git status
```

Example:

```txt
both added:
  package.json

both modified:
  Navbar.tsx
```

---

## Finish Merge

After conflicts are resolved:

```bash
git add .
git commit
```

or

```bash
git commit -m "resolve merge conflicts"
```

---

## Push Changes

```bash
git push origin main
```

---

## Delete Old Branch

Delete local branch:

```bash
git branch -d master
```

Delete remote branch:

```bash
git push origin --delete master
```

---

# Hamza's Rule

Before resolving a conflict, ask:

```txt
Which branch contains the real work?
```

If master contains the real work:

```bash
git checkout --theirs .
git add .
git commit -m "merge master into main"
```

If main contains the real work:

```bash
git checkout --ours .
git add .
git commit -m "keep main"
```

Never blindly choose ours or theirs until you know which branch actually contains the desired code.
