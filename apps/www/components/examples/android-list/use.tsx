"use client";
import { useState } from "react";
import {
	AndroidList,
	AndroidListRow,
	AndroidSwitch,
	Icon,
} from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseCopy, UseStack } from "../use-frame";
export function Use() {
	const [connected, setConnected] = useState(true);
	const [network, setNetwork] = useState("Studio network");
	return (
		<UseField name="android-list">
			<UseType>Connection settings</UseType>
			<UseBody>
				<UseStack>
					<AndroidList aria-label="Connections">
						<AndroidListRow
							headline="Wi-Fi"
							supportingText={connected ? network : "Disconnected"}
							leading={<Icon name="wifi" size={24} />}
							onAction={() =>
								setNetwork(
									network === "Studio network"
										? "Guest network"
										: "Studio network",
								)
							}
							actionProps={{ "aria-label": "Change Wi-Fi network" }}
							trailing={
								<AndroidSwitch
									aria-label="Wi-Fi enabled"
									checked={connected}
									onCheckedChange={setConnected}
								/>
							}
						/>
						<AndroidListRow headline="Device name" supportingText="Pixel" />
						<AndroidListRow
							headline="Airplane mode"
							supportingText="Unavailable during this connection"
							onAction={() => {}}
							disabled
						/>
					</AndroidList>
					<UseCopy>
						The row changes the network. Its separate switch turns the
						connection on or off.
					</UseCopy>
				</UseStack>
			</UseBody>
		</UseField>
	);
}
