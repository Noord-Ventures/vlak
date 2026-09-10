"use client";
import { useState } from "react";
import { AndroidChip } from "@noorddev/vlak-react";
import {
	UseField,
	UseType,
	UseBody,
	UseCopy,
	UseStack,
	UseActions,
} from "../use-frame";
export function Use() {
	const [unread, setUnread] = useState(false);
	const [starred, setStarred] = useState(true);
	return (
		<UseField name="android-chip">
			<UseType>Filter your inbox</UseType>
			<UseBody>
				<UseStack>
					<UseActions>
						<AndroidChip selected={unread} onSelectedChange={setUnread}>
							Unread
						</AndroidChip>
						<AndroidChip selected={starred} onSelectedChange={setStarred}>
							Starred
						</AndroidChip>
						<AndroidChip disabled>Archived</AndroidChip>
					</UseActions>
					<UseCopy>
						{[unread && "unread", starred && "starred"]
							.filter(Boolean)
							.join(" and ") || "All"}{" "}
						messages are shown.
					</UseCopy>
				</UseStack>
			</UseBody>
		</UseField>
	);
}
