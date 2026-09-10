"use client";
import { useState } from "react";
import {
	AndroidAppBar,
	AndroidAppBarAction,
	Button,
	Icon,
} from "@noorddev/vlak-react";
import {
	UseField,
	UseType,
	UseBody,
	UseCopy,
	UseStack,
	UseActions,
} from "../use-frame";
export function Use() {
	const [folder, setFolder] = useState("Documents");
	const [medium, setMedium] = useState(false);
	return (
		<UseField name="android-app-bar">
			<UseType>Document browser</UseType>
			<UseBody>
				<UseStack>
					<AndroidAppBar
						title={folder}
						variant={medium ? "medium" : "small"}
						navigation={
							<AndroidAppBarAction
								aria-label="Back to documents"
								disabled={folder === "Documents"}
								onClick={() => setFolder("Documents")}
							>
								<Icon name="arrow-left" size={24} />
							</AndroidAppBarAction>
						}
						actions={
							<AndroidAppBarAction
								aria-label="Open search"
								onClick={() => setFolder("Search documents")}
							>
								<Icon name="search" size={24} />
							</AndroidAppBarAction>
						}
					/>
					<UseActions>
						<Button variant="ghost" onClick={() => setFolder("Project notes")}>
							Open project notes
						</Button>
						<Button
							variant="ghost"
							aria-pressed={medium}
							onClick={() => setMedium(!medium)}
						>
							Larger title
						</Button>
					</UseActions>
					<UseCopy>
						Navigation and actions keep their own touch targets as the title
						changes.
					</UseCopy>
				</UseStack>
			</UseBody>
		</UseField>
	);
}
