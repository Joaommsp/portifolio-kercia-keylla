"use client";

/**
 * Formulário de entrada no painel.
 *
 * Nem o e-mail nem a senha têm teto de caracteres: um `maxLength` aqui cortaria
 * silenciosamente um e-mail longo ou uma senha colada do gerenciador, e
 * trancaria a autora fora do próprio site. O erro exibido é o traduzido pelo
 * `entrar`, que não revela se o e-mail existe (ADM-02, ADM-03).
 */

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Campo } from "@/components/form/campo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { painel } from "@/content/site";
import { entrar } from "@/features/admin/auth";
import { CAMINHO_PAINEL } from "@/lib/rotas";

type CamposDeLogin = {
  email: string;
  senha: string;
};

const { login } = painel;

export function LoginForm() {
  const router = useRouter();
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CamposDeLogin>({ defaultValues: { email: "", senha: "" } });

  const enviar = handleSubmit(async ({ email, senha }) => {
    const resultado = await entrar(email.trim(), senha);

    if ("erro" in resultado) {
      // Nada é limpo: a autora corrige o que errou sem redigitar o resto. A
      // mensagem do Firebase segue fiel — só sai do meio do formulário.
      toast.error(painel.avisos.entrouFalhou, { description: resultado.erro });
      return;
    }

    router.replace(CAMINHO_PAINEL);
  });

  return (
    <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
      <fieldset disabled={isSubmitting} className="flex flex-col gap-5">
        <Campo
          id="login-email"
          rotulo={login.email.rotulo}
          erro={errors.email?.message}
        >
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            className="h-11"
            aria-invalid={errors.email !== undefined}
            {...register("email", { required: login.email.obrigatorio })}
          />
        </Campo>

        <Campo
          id="login-senha"
          rotulo={login.senha.rotulo}
          erro={errors.senha?.message}
        >
          <div className="relative">
            <Input
              id="login-senha"
              type={senhaVisivel ? "text" : "password"}
              autoComplete="current-password"
              className="h-11 pr-12"
              aria-invalid={errors.senha !== undefined}
              {...register("senha", { required: login.senha.obrigatorio })}
            />
            {/*
              Ver a senha resolve a dúvida mais comum de quem erra a entrada:
              foi a senha ou o Caps Lock? O estado vai em `aria-pressed`, para
              o leitor de tela anunciar que a senha está à mostra.
            */}
            <button
              type="button"
              onClick={() => setSenhaVisivel((visivel) => !visivel)}
              aria-pressed={senhaVisivel}
              aria-label={
                senhaVisivel
                  ? login.senhaVisivel.ocultar
                  : login.senhaVisivel.mostrar
              }
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-ink-soft transition-colors pointer-fino:hover:text-olive"
            >
              {senhaVisivel ? (
                <EyeOff aria-hidden className="size-4.5" />
              ) : (
                <Eye aria-hidden className="size-4.5" />
              )}
            </button>
          </div>
        </Campo>

        <Button type="submit" size="lg" className="h-11">
          {isSubmitting ? login.acao.emAndamento : login.acao.rotulo}
        </Button>
      </fieldset>
    </form>
  );
}
