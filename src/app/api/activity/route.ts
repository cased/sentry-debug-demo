import { NextResponse } from "next/server";

const usernames = ["alice", "bob", "charlie", "diana", "eve", "frank"];
const actions = ["login", "purchase", "view_report", "export_data", "update_settings", "invite_user"];
const statuses = ["success", "success", "success", "warning", "error"] as const;

function generateActivityData() {
  const events = [];
  const now = new Date();

  for (let i = 0; i < 20; i++) {
    const timestamp = new Date(now.getTime() - i * 1000 * 60 * Math.random() * 60);
    events.push({
      event_id: `evt_${Math.random().toString(36).substr(2, 9)}`,
      created_at: timestamp.toISOString(),
      username: usernames[Math.floor(Math.random() * usernames.length)],
      event_type: actions[Math.floor(Math.random() * actions.length)],
      result: statuses[Math.floor(Math.random() * statuses.length)],
    });
  }

  return { events: events.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )};
}

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 150));

  const data = generateActivityData();

  return NextResponse.json(data);
}
