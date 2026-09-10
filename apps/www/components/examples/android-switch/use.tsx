"use client";
import { useState } from "react";
import {
	AndroidSwitch,
	AndroidList,
	AndroidListRow,
} from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseCopy, UseStack } from "../use-frame";
export function Use() {
	const [enabled, setEnabled] = useState(true);
	return (
		<UseField name="android-switch">
			<UseType>Background sync</UseType>
			<UseBody>
				<UseStack>
					<AndroidList>
						<AndroidListRow
							headline={
								<label htmlFor="android-sync-demo">Sync documents</label>
							}
							supportingText="Keep this device up to date"
							trailing={
								<AndroidSwitch
									id="android-sync-demo"
									checked={enabled}
									onCheckedChange={setEnabled}
								/>
							}
						/>
					</AndroidList>
					<UseCopy>
						{enabled
							? "Documents will sync in the background."
							: "Sync is paused on this device."}
					</UseCopy>
				</UseStack>
			</UseBody>
		</UseField>
	);
}
