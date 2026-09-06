"use client";

import { useState } from "react";
import { QuantityField } from "@noorddev/vlak-react";
import type { QuantityValue } from "@noorddev/vlak-react";
import { UseField, UseType, UseBody, UseStack, UseKicker } from "../use-frame";

export function Use() {
  const [quantity, setQuantity] = useState<QuantityValue>({ amount: 250, unit: "ul" });
  return <UseField name="quantity-field"><UseType>Prepare the record</UseType><UseBody><UseStack>
    <UseKicker>Aliquot / Sample 042</UseKicker>
    <QuantityField label="Recorded volume" name="volume" value={quantity} min={0} units={[{ value: "ul", label: "µL" }, { value: "ml", label: "mL" }]} description="Change the unit to express the same entered volume" onValueChange={next => {
      if (next.unit && quantity.unit && next.unit !== quantity.unit && quantity.amount != null) setQuantity({ amount: next.unit === "ml" ? quantity.amount / 1000 : quantity.amount * 1000, unit: next.unit });
      else setQuantity(next);
    }} />
  </UseStack></UseBody></UseField>;
}
