"use client";
import { useState } from "react";
import {
	AndroidFab,
	AndroidList,
	AndroidListRow,
	Icon,
} from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack } from "../use-frame";
export function Use() {
	const [notes, setNotes] = useState(["Project notes"]);
	return (
		<UseField name="android-fab">
			<UseType>Create a note</UseType>
			<UseBody>
				<UseStack>
					<AndroidList aria-label="Notes">
						{notes.map((note) => (
							<AndroidListRow key={note} headline={note} />
						))}
					</AndroidList>
					<AndroidFab
						icon={<Icon name="plus" size={24} />}
						onClick={() =>
							setNotes([...notes, `Untitled note ${notes.length}`])
						}
					>
						New note
					</AndroidFab>
				</UseStack>
			</UseBody>
		</UseField>
	);
}
