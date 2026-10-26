export type ModalOptionValue = string | number | boolean;

export interface ModalOption {
  label: string;
  /** Optional muted line under the label, for choices that need explaining. */
  hint?: string;
  value: ModalOptionValue;
}
