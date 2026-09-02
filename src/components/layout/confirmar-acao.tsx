"use client";

/**
 * Diálogo de confirmação, um só para todo o painel: excluir, sair do painel e
 * abandonar alterações não salvas passam por aqui.
 *
 * Existe para nunca haver `window.confirm` no projeto — o nativo não pode ser
 * estilizado nem lido pelo teste, e some no meio do navegador (ADM-09). Quem
 * chama guarda o alvo da ação; aqui fica apenas a pergunta e as duas saídas
 * (ADM-06).
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

export function ConfirmarAcao({
  aberto,
  titulo,
  descricao,
  rotuloConfirmar,
  rotuloCancelar,
  destrutiva = false,
  aoConfirmar,
  aoFechar,
}: {
  aberto: boolean;
  titulo: string;
  descricao: string;
  rotuloConfirmar: string;
  rotuloCancelar: string;
  /** Pinta a confirmação de vermelho. Só para o que não tem volta. */
  destrutiva?: boolean;
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
          <AlertDialogAction
            variant={destrutiva ? "destructive" : "default"}
            onClick={aoConfirmar}
          >
            {rotuloConfirmar}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
