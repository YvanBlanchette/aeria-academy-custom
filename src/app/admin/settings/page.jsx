import { getAdminSettingsBundle } from "./actions";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
	const bundle = await getAdminSettingsBundle();

	return (
		<SettingsClient
			initialSettings={bundle.settings}
			initialAudit={bundle.audit}
			permissions={bundle.permissions}
		/>
	);
}
