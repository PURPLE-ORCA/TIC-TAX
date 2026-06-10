import { Activity, type ComponentType, type ReactNode } from "react";

type CaseComponent = ReactNode | ComponentType;

export interface SwitchProps {
  /** List of case components to be rendered when case matches */
  components: Record<string | number, CaseComponent>;
  /** Default component to be rendered if the value does not match any of the given cases */
  defaultComponent: CaseComponent;
  /** Value to check with the cases to render the corresponding component */
  value: string | number;
}

function renderCase(component: CaseComponent) {
  if (typeof component === "function") {
    const Component = component;
    return <Component />;
  }
  return <>{component}</>;
}

/**
 * Renders one of the provided case components based on value.
 * Uses Activity to preserve DOM & component state across case switches.
 */
export function Switch({ components, defaultComponent, value }: SwitchProps) {
  const allKeys = Object.keys(components);
  const activeKey = allKeys.find((key) => key === String(value));

  return (
    <>
      {allKeys.map((key) => (
        <Activity key={key} mode={key === activeKey ? "visible" : "hidden"}>
          {renderCase(components[key])}
        </Activity>
      ))}
      <Activity mode={activeKey === undefined ? "visible" : "hidden"}>
        {renderCase(defaultComponent)}
      </Activity>
    </>
  );
}
