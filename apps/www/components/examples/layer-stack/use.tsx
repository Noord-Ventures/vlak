"use client";

import { useState } from "react";
import { LayerStack } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  const [layers, setLayers] = useState([{ id: "title", label: "Title", visible: true, locked: false }, { id: "caption", label: "Caption", visible: true, locked: false }, { id: "background", label: "Background", visible: true, locked: true }]);
  const [selected, setSelected] = useState<string | null>("title");
  return <UseField name="layer-stack"><UseType>Keep the composition ordered</UseType><UseBody><UseStack><UseKicker>Cover art</UseKicker><LayerStack label="Layers" layers={layers} onLayersChange={setLayers} selectedId={selected} onSelect={setSelected} /></UseStack></UseBody></UseField>;
}
