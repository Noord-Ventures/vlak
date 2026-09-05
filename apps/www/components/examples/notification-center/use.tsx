import { NotificationCenter } from "@noorddev/vlak-react";

export function Use() {
  return <NotificationCenter defaultValue={[{ id: "export", title: "Export ready", description: "Your study is ready to download" }, { id: "invite", title: "Studio invitation", read: true }]} />;
}
