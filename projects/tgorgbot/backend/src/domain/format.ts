const MAX_TOPIC_TITLE_LENGTH = 128;

export type InitialHeaderMessageInput = {
  participant_display_name: string;
  participant_username?: string;
  participant_user_id: number;
  text_preview?: string;
};

export function formatTopicTitle(
  displayName: string,
  username?: string
): string {
  const safeName = normalizeDisplayName(displayName);
  const normalizedUsername = normalizeUsername(username);
  const baseTitle = normalizedUsername
    ? `${safeName} (${normalizedUsername})`
    : safeName;

  return truncateToLength(baseTitle, MAX_TOPIC_TITLE_LENGTH);
}

export function formatInitialHeaderMessage(
  input: InitialHeaderMessageInput
): string {
  const displayName = normalizeDisplayName(input.participant_display_name);
  const username = normalizeUsername(input.participant_username);
  const preview = input.text_preview?.trim();

  const lines = [
    "New conversation",
    `Name: ${displayName}`,
    `Username: ${username ?? "(none)"}`,
    `User ID: ${input.participant_user_id}`
  ];

  if (preview) {
    lines.push("First message:");
    lines.push(preview);
  }

  return lines.join("\n");
}

function normalizeUsername(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  if (trimmed.startsWith("@")) {
    return trimmed;
  }
  return `@${trimmed}`;
}

function normalizeDisplayName(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "Participant";
  }
  return trimmed;
}

function truncateToLength(value: string, max: number): string {
  if (value.length <= max) {
    return value;
  }
  return value.slice(0, max);
}
