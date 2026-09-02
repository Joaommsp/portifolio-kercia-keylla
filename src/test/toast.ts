import { vi } from "vitest";

/**
 * Dublê do `sonner`, usado por toda tela do painel que avisa por toast.
 *
 * Fica aqui em vez do `setup.ts` global: assim uma suíte que um dia queira
 * exercitar o `Toaster` de verdade pode simplesmente não importar este módulo.
 */
export const dubleDoToast = {
  error: vi.fn(),
  success: vi.fn(),
};

export function mockarToast() {
  vi.mock("sonner", () => ({ toast: dubleDoToast }));
}
