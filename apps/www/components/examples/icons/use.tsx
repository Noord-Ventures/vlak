import { Icon, Icons } from "@noorddev/vlak-react";
import { UseField } from "../use-frame";

export function Use() {
  return (
    <UseField name="icons">
      <h3 className="rs-use-type">Icons</h3>
      <div className="rs-use-body">
        <Icons className="rs-use-actions">
          <Icon name="arrow-right" size={24} />
          <Icon name="search" size={24} />
          <Icon name="check" size={24} />
          <Icon name="close" size={24} />
          <Icon name="plus" size={24} />
          <Icon name="sun" size={24} variant="filled" />
          <Icon name="moon" size={24} variant="filled" />
        </Icons>
      </div>
    </UseField>
  );
}
