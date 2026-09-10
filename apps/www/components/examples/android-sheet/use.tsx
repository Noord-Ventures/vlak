"use client";
import { useState } from "react";
import {
	AndroidSheet,
	AndroidSheetTitle,
	AndroidSheetBody,
	AndroidList,
	AndroidListRow,
	AndroidSwitch,
	Button,
} from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseCopy, UseStack } from "../use-frame";
export function Use() {
	const [open, setOpen] = useState(false);
	const [enabled, setEnabled] = useState(true);
	return (
		<UseField name="android-sheet">
			<UseType>Contextual settings</UseType>
			<UseBody>
				<UseStack>
					<Button onClick={() => setOpen(true)}>Connection settings</Button>
					<UseCopy>
						Background sync is {enabled ? "enabled" : "paused"}.
					</UseCopy>
					<AndroidSheet open={open} onOpenChange={setOpen}>
						<AndroidSheetTitle>Connection settings</AndroidSheetTitle>
						<AndroidSheetBody>
							Choose how this device keeps documents up to date.
						</AndroidSheetBody>
						<AndroidList>
							<AndroidListRow
								headline={
									<label htmlFor="android-sheet-sync">Background sync</label>
								}
								supportingText="Use the current connection"
								trailing={
									<AndroidSwitch
										id="android-sheet-sync"
										checked={enabled}
										onCheckedChange={setEnabled}
									/>
								}
							/>
						</AndroidList>
					</AndroidSheet>
				</UseStack>
			</UseBody>
		</UseField>
	);
}
