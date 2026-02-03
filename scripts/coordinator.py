#!/usr/bin/env python3
"""
Lightweight coordinator that labels Codex-approved PRs for Mergify to squash-merge.
- Uses only the GitHub CLI (`gh`); no external Python deps.
- Observes branch_state_<repo>.json files for sequencing/rebase gates.
- Intended to run via cron every 5–10 minutes.
"""
import datetime
import json
import os
import re
import shlex
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import tempfile

APPROVAL_PHRASES = [
    "no issues found",
    "didn't find any major issues",
    "all suggestions addressed",
    "ready to merge",
    "looks good to merge",
]
CODEX_USERNAMES = {"chatgpt-codex-connector", "codex", "codex-bot", "chatgpt-codex"}
BLOCKING_COMMENT_PHRASES = [
    "do not merge",
    "block",
    "blocking",
    "changes requested",
]

DEFAULT_ALLOWED_REPOS: List[str] = []  # MUST set via ALLOWED_REPOS env to GitHub repo slug(s), e.g., oneaiguru/ai
CHECK_PLACEHOLDER = "<fill-required-ci-check>"
DEFAULT_REQUIRED_CHECKS = [CHECK_PLACEHOLDER]  # MUST set via REQUIRED_CHECKS env to actual check name(s)

APPROVE_WITH_REVIEW = os.getenv("COORDINATOR_APPROVE", "false").lower() == "true"
STATE_DIR = Path(os.getenv("BRANCH_STATE_DIR", Path(__file__).parent)).expanduser()
ALLOWED_REPOS = [
    r.strip()
    for r in os.getenv("ALLOWED_REPOS", ",".join(DEFAULT_ALLOWED_REPOS)).split(",")
    if r.strip()
]
REQUIRED_CHECKS = [
    c.strip()
    for c in os.getenv("REQUIRED_CHECKS", ",".join(DEFAULT_REQUIRED_CHECKS)).split(",")
    if c.strip()
]


def log(msg: str) -> None:
    now = datetime.datetime.utcnow().isoformat() + "Z"
    print(f"[{now}] {msg}")


def run_gh(repo: str, args: List[str]) -> Dict[str, Any]:
    cmd = ["gh"] + args + ["-R", repo]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"gh command failed: {' '.join(shlex.quote(x) for x in cmd)}\n{result.stderr}")
    if not result.stdout.strip():
        return {}
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        raise RuntimeError(f"Failed to parse gh output: {result.stdout}")


def list_open_prs(repo: str) -> List[Dict[str, Any]]:
    data = run_gh(
        repo,
        [
            "pr",
            "list",
            "--state",
            "open",
            "--limit",
            "200",
            "--json",
            "number,title,headRefName,baseRefName,isDraft,labels",
        ],
    )
    return data


def get_pr_details(repo: str, number: int, include_checks: bool = True) -> Dict[str, Any]:
    fields = [
        "number",
        "title",
        "baseRefName",
        "headRefName",
        "isDraft",
        "state",
        "labels",
        "comments",
        "reviews",
    ]
    if include_checks:
        fields.append("statusCheckRollup")
    return run_gh(
        repo,
        [
            "pr",
            "view",
            str(number),
            "--json",
            ",".join(fields),
        ],
    )


def extract_labels(label_data: Any) -> List[str]:
    labels = []
    if isinstance(label_data, list):
        for item in label_data:
            name = None
            if isinstance(item, dict):
                name = item.get("name") or item.get("label")
            elif isinstance(item, str):
                name = item
            if name:
                labels.append(name)
    elif isinstance(label_data, dict):
        nodes = label_data.get("nodes", [])
        for node in nodes:
            if isinstance(node, dict) and node.get("name"):
                labels.append(node["name"])
    return labels


def parse_time(ts: Optional[str]) -> Optional[datetime.datetime]:
    if not ts:
        return None
    try:
        return datetime.datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except Exception:
        return None


def find_latest_codex_approval(comments: Any, reviews: Any = None) -> Tuple[Optional[datetime.datetime], Optional[str]]:
    latest_time = None
    body_snapshot = None

    def consider(author: str, body: str, ts: Optional[datetime.datetime]) -> None:
        nonlocal latest_time, body_snapshot
        author_lower = (author or "").lower()
        body_lower = (body or "").lower()
        if author_lower not in CODEX_USERNAMES:
            return
        if not any(phrase in body_lower for phrase in APPROVAL_PHRASES):
            return
        if latest_time is None or (ts and ts > latest_time):
            latest_time = ts
            body_snapshot = body

    comment_nodes = []
    if isinstance(comments, dict):
        comment_nodes = comments.get("nodes", [])
    elif isinstance(comments, list):
        comment_nodes = comments
    for node in comment_nodes:
        body = (node or {}).get("body", "")
        author = ((node or {}).get("author") or {}).get("login", "")
        ts = parse_time((node or {}).get("createdAt"))
        consider(author, body, ts)

    review_nodes = []
    if isinstance(reviews, dict):
        review_nodes = reviews.get("nodes", [])
    elif isinstance(reviews, list):
        review_nodes = reviews
    for review in review_nodes:
        body = (review or {}).get("body", "")
        author = ((review or {}).get("author") or {}).get("login", "")
        ts = parse_time((review or {}).get("submittedAt"))
        consider(author, body, ts)
    return latest_time, body_snapshot


def has_blocking_review_after(approval_time: Optional[datetime.datetime], reviews: Any) -> bool:
    review_nodes = []
    if isinstance(reviews, dict):
        review_nodes = reviews.get("nodes", [])
    elif isinstance(reviews, list):
        review_nodes = reviews
    for review in review_nodes:
        state = (review or {}).get("state", "").upper()
        author = ((review or {}).get("author") or {}).get("login", "").lower()
        submitted_at = parse_time((review or {}).get("submittedAt"))
        if state == "CHANGES_REQUESTED" and author not in CODEX_USERNAMES:
            if approval_time is None or (submitted_at and submitted_at > approval_time):
                return True
    return False


def has_blocking_comment_after(approval_time: Optional[datetime.datetime], comments: Any) -> bool:
    nodes = []
    if isinstance(comments, dict):
        nodes = comments.get("nodes", [])
    elif isinstance(comments, list):
        nodes = comments
    for node in nodes:
        body = (node or {}).get("body", "")
        author = ((node or {}).get("author") or {}).get("login", "").lower()
        created_at = parse_time((node or {}).get("createdAt"))
        if author in CODEX_USERNAMES:
            continue
        if approval_time and created_at and created_at <= approval_time:
            continue
        body_lower = body.lower()
        if any(phrase in body_lower for phrase in BLOCKING_COMMENT_PHRASES):
            return True
    return False


def fetch_review_comments(repo: str, number: int) -> List[Dict[str, Any]]:
    """
    Fetch review comments (inline + replies) via gh api.
    Replies have in_reply_to_id set; top-level comments have it null.
    """
    cmd = [
        "gh",
        "api",
        f"repos/{repo}/pulls/{number}/comments",
        "--paginate",
        "--jq",
        '.[] | {id, in_reply_to_id, author: .user.login, body, path, line, created_at}',
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        log(f"[WARN] Failed to fetch review comments for {repo}#{number}: {result.stderr.strip()}")
        return []
    comments: List[Dict[str, Any]] = []
    for line in result.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            comments.append(json.loads(line))
        except json.JSONDecodeError:
            log(f"[WARN] Skipping unparsable review comment line for {repo}#{number}: {line}")
    return comments


def has_blocking_review_comment_after(approval_time: Optional[datetime.datetime], review_comments: List[Dict[str, Any]]) -> bool:
    for rc in review_comments:
        author = (rc.get("author") or "").lower()
        if author in CODEX_USERNAMES:
            continue
        created_at = parse_time(rc.get("created_at"))
        if approval_time and created_at and created_at <= approval_time:
            continue
        body_lower = (rc.get("body") or "").lower()
        if any(phrase in body_lower for phrase in BLOCKING_COMMENT_PHRASES):
            return True
    return False


def required_checks_passed(status_check_rollup: Any) -> bool:
    if not REQUIRED_CHECKS:
        return True
    if any(check == CHECK_PLACEHOLDER for check in REQUIRED_CHECKS):
        log("[SKIP] REQUIRED_CHECKS not configured (placeholder present); set REQUIRED_CHECKS env to real CI names.")
        return False
    contexts = []
    if isinstance(status_check_rollup, dict):
        contexts = status_check_rollup.get("contexts", [])
    for required in REQUIRED_CHECKS:
        found_success = False
        for ctx in contexts:
            name = (ctx or {}).get("name")
            conclusion = ((ctx or {}).get("conclusion") or "").upper()
            if name == required and conclusion == "SUCCESS":
                found_success = True
                break
        if not found_success:
            return False
    return True


def sanitize_repo_slug(repo: str) -> str:
    return repo.replace("/", "_").replace("-", "_").lower()


def load_branch_state(repo: str) -> Optional[Dict[str, Any]]:
    slug = sanitize_repo_slug(repo)
    path = STATE_DIR / f"branch_state_{slug}.json"
    if not path.exists():
        log(f"[WARN] Missing branch_state file for {repo} ({path}); proceeding without branch gating")
        return {"repo": repo, "state": "open", "pr_index": None, "total_prs": None, "requires_rebase": False}
    try:
        return json.loads(path.read_text())
    except Exception as exc:
        log(f"[WARN] Failed to read branch_state for {repo}: {exc}; proceeding without branch gating")
        return {"repo": repo, "state": "open", "pr_index": None, "total_prs": None, "requires_rebase": False}


def save_branch_state(repo: str, state: Dict[str, Any]) -> None:
    slug = sanitize_repo_slug(repo)
    path = STATE_DIR / f"branch_state_{slug}.json"
    state_copy = dict(state)
    state_copy["last_codex_check"] = datetime.datetime.utcnow().isoformat() + "Z"
    path.write_text(json.dumps(state_copy, indent=2) + "\n")


def parse_pr_index(pr: Dict[str, Any], state: Dict[str, Any]) -> Tuple[Optional[int], Optional[str]]:
    # Prefer branch_state hint
    index = state.get("pr_index") if isinstance(state, dict) else None
    repo_slug = state.get("repo") if isinstance(state, dict) else None
    title = pr.get("title", "")
    match = re.search(r"import:([^:]+):(\d+)", title)
    if match:
        repo_slug = repo_slug or match.group(1)
        try:
            index = index or int(match.group(2))
        except ValueError:
            pass
    return index, repo_slug


def previous_pr_is_merged(repo: str, pr: Dict[str, Any], state: Dict[str, Any]) -> bool:
    index, repo_slug = parse_pr_index(pr, state)
    if not index or index <= 1:
        return True
    prev_index = index - 1
    slug_for_title = repo_slug or repo.split("/")[-1]
    needle = f"import:{slug_for_title}:{prev_index:02d}"
    try:
        merged = run_gh(
            repo,
            ["pr", "list", "--state", "merged", "--limit", "200", "--json", "title"],
        )
    except RuntimeError as exc:
        log(f"[SKIP] Could not check previous PR merge for {repo}: {exc}")
        return False
    for merged_pr in merged:
        title = (merged_pr or {}).get("title", "")
        if needle in title:
            return True
    return False


def add_label(repo: str, number: int, label: str) -> bool:
    try:
        subprocess.run([
            "gh",
            "pr",
            "edit",
            str(number),
            "-R",
            repo,
            "--add-label",
            label,
        ], check=True)
        return True
    except subprocess.CalledProcessError as exc:
        log(f"[ERROR] Failed to add label on {repo}#{number}: {exc}")
        return False


def approve_pr(repo: str, number: int) -> None:
    try:
        subprocess.run(
            [
                "gh",
                "pr",
                "review",
                str(number),
                "--approve",
                "--body",
                "Auto-approving after Codex sign-off.",
                "-R",
                repo,
            ],
            check=True,
        )
    except subprocess.CalledProcessError as exc:
        log(f"[WARN] Failed to auto-approve {repo}#{number}: {exc}")


def process_pr(repo: str, pr: Dict[str, Any], state: Dict[str, Any]) -> None:
    number = pr.get("number")
    labels = set(extract_labels(pr.get("labels", [])))
    if pr.get("isDraft"):
        log(f"[SKIP] {repo}#{number}: draft PR")
        return
    if pr.get("baseRefName") != "main":
        log(f"[SKIP] {repo}#{number}: base is {pr.get('baseRefName')} (not main)")
        return
    if "codex-approved" in labels:
        log(f"[SKIP] {repo}#{number}: already labeled codex-approved")
        return
    if state.get("requires_rebase"):
        log(f"[SKIP] {repo}#{number}: branch_state requires_rebase=true")
        return
    if state.get("state") == "blocked":
        log(f"[SKIP] {repo}#{number}: branch_state marked blocked")
        return
    # Only enforce sequential gating if pr_index is known
    if state.get("pr_index") is not None and not previous_pr_is_merged(repo, pr, state):
        log(f"[SKIP] {repo}#{number}: previous PR not merged")
        return

    include_checks = bool(REQUIRED_CHECKS)
    details = get_pr_details(repo, number, include_checks=include_checks)
    approval_time, approval_body = find_latest_codex_approval(details.get("comments"), details.get("reviews"))
    review_comments = fetch_review_comments(repo, number)
    if not approval_time:
        log(f"[SKIP] {repo}#{number}: no Codex approval phrase found")
        return
    if has_blocking_review_after(approval_time, details.get("reviews")):
        log(f"[SKIP] {repo}#{number}: blocking review after approval")
        return
    if has_blocking_review_comment_after(approval_time, review_comments):
        log(f"[SKIP] {repo}#{number}: blocking review comment after approval")
        return
    if has_blocking_comment_after(approval_time, details.get("comments")):
        log(f"[SKIP] {repo}#{number}: blocking comment after approval")
        return
    if include_checks and not required_checks_passed(details.get("statusCheckRollup")):
        log(f"[SKIP] {repo}#{number}: required checks not green")
        return

    if add_label(repo, number, "codex-approved"):
        log(f"[ACTION] Labeled {repo}#{number} as codex-approved (Codex said: {approval_body!r})")
        if APPROVE_WITH_REVIEW:
            approve_pr(repo, number)
        state["state"] = "codex-approved"
        state["last_codex_check"] = datetime.datetime.utcnow().isoformat() + "Z"
        save_branch_state(repo, state)


def process_repo(repo: str) -> None:
    state = load_branch_state(repo)
    if not state:
        return
    try:
        prs = list_open_prs(repo)
    except RuntimeError as exc:
        log(f"[SKIP] Could not list PRs for {repo}: {exc}")
        return
    for pr in prs:
        process_pr(repo, pr, state)


def main() -> int:
    if not ALLOWED_REPOS:
        log("No allowed repos configured; exiting.")
        return 0
    for repo in ALLOWED_REPOS:
        process_repo(repo)
    return 0


if __name__ == "__main__":
    sys.exit(main())
