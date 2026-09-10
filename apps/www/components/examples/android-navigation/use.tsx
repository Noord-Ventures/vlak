"use client";
import { useState } from "react";
import { AndroidNavigation, Button, Icon } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseCopy, UseStack } from "../use-frame";
export function Use() {
	const [value, setValue] = useState("home");
	const [rail, setRail] = useState(false);
	const items = [
		{ value: "home", label: "Home", icon: <Icon name="home" size={24} /> },
		{ value: "files", label: "Files", icon: <Icon name="folder" size={24} /> },
		{
			value: "search",
			label: "Search",
			icon: <Icon name="search" size={24} />,
		},
	];
	return (
		<UseField name="android-navigation">
			<UseType>Workspace destinations</UseType>
			<UseBody>
				<UseStack>
					<AndroidNavigation
						aria-label="Workspace"
						items={items}
						value={value}
						onValueChange={setValue}
						orientation={rail ? "vertical" : "horizontal"}
					/>
					<UseCopy>
						Current destination:{" "}
						{items.find((item) => item.value === value)?.label}.
					</UseCopy>
					<Button
						variant="ghost"
						aria-pressed={rail}
						onClick={() => setRail(!rail)}
					>
						Vertical rail
					</Button>
				</UseStack>
			</UseBody>
		</UseField>
	);
}
