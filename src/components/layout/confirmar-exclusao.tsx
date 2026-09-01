"use client";

/**
 * Diálogo de confirmação de exclusão, um só para todo o painel.
 *
 * Existe para nunca haver `window.confirm` no projeto — o nativo não pode ser
 * estilizado nem lido pelo teste, e some no meio do navegador (ADM-09). Quem
 * chama guarda o alvo da exclusão; aqui fica apenas a pergunta e as duas
 * saídas (ADM-06).
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function ConfirmarExclusao({
  aberto,
  titulo,
  descricao,
  rotuloConfirmar,
  rotuloCancelar,
  aoConfirmar,
  aoFechar,
}: {
  aberto: boolean;
  titulo: string;
  descricao: string;
  rotuloConfirmar: string;
  rotuloCancelar: string;
  aoConfirmar: () => void;
  aoFechar: () => void;
}) {
  return (
    <AlertDialog
      open={aberto}
      onOpenChange={(estaAberto) => {
        if (!estaAberto) {
          aoFechar();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descricao}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>{rotuloCancelar}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={aoConfirmar}>
            {rotuloConfirmar}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
