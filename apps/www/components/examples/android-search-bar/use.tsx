"use client";
import { useState } from "react";
import {
	AndroidSearchBar,
	AndroidList,
	AndroidListRow,
} from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseCopy, UseStack } from "../use-frame";
const files = ["Project notes", "Research library", "Travel plans"];
export function Use() {
	const [query, setQuery] = useState("");
	const results = files.filter((file) =>
		file.toLowerCase().includes(query.toLowerCase()),
	);
	return (
		<UseField name="android-search-bar">
			<UseType>Find a document</UseType>
			<UseBody>
				<UseStack>
					<AndroidSearchBar
						aria-label="Search documents"
						placeholder="Search documents"
						value={query}
						onValueChange={setQuery}
					/>
					<AndroidList aria-label="Search results">
						{results.map((file) => (
							<AndroidListRow key={file} headline={file} />
						))}
					</AndroidList>
					<UseCopy>
						{results.length} {results.length === 1 ? "document" : "documents"}{" "}
						found.
					</UseCopy>
				</UseStack>
			</UseBody>
		</UseField>
	);
}
